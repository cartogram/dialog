import {
  IncomingMessage,
  ServerResponse,
  createServer as createHttpServer,
} from 'http';
import 'isomorphic-fetch';
import util from 'util';

import {Logger} from '@cartogram/dialog-logger';
import dotenv from 'dotenv';
import React from 'react';
import {
  reconcile,
  render,
  generateEvent,
  DialogError,
} from '@cartogram/dialog-core';
import {createEventAdapter} from '@slack/events-api';
import {createMessageAdapter} from '@slack/interactive-messages';
import {WebClient} from '@slack/web-api';

import {Logger as MiddlewareLogger} from '../middleware';
import {compose, route, runIf, pathMatches, noopNext} from '../utilities';
import {
  Context,
  Middleware,
  DialogMessage,
  DialogModal,
  SubmitEvent,
  InteractionEvent,
} from '../types';
import {DialogCache} from '../cache';

dotenv.config();

interface Options {
  port?: number;
  ip?: string;
  token?: string;
}

interface HomeOptions {
  onlyOpen?: boolean;
  component: any;
}

interface MessageOptions {
  channel: string;
  [key: string]: any;
}

const DEFAULT_IP = 'localhost';
const DEFAULT_PORT = 3000;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';
const TOKEN = process.env.SLACK_TOKEN || '';
const CACHE = new DialogCache();

const logger = new Logger('dialog:server');

logger.log('secret', SLACK_SIGNING_SECRET);
logger.log('token', TOKEN);

/**
 * Expose `Dialog Server` class.
 * Inherits from `Emitter.prototype`.
 */

export class DialogServer {
  public client: WebClient;

  private readonly port: number;
  private readonly ip: string;
  private readonly logger: MiddlewareLogger;
  private readonly middleware: Middleware[];
  private readonly interactions: Middleware[];
  private readonly events: Middleware[];
  private readonly cache: DialogCache;
  private readonly components: Map<string, any> = new Map();

  /**
   * Initialize a new `Dialog Server`.
   *
   * @api public
   */

  /**
   *
   * @param {object} [options] Dialog Server options
   *
   */
  constructor(components: Function[] = [], options: Options = {}) {
    const {port, ip} = options;

    // TODO(parley): throw config errors here, ie missing token
    this.port = port || DEFAULT_PORT;
    this.ip = ip || DEFAULT_IP;
    this.logger = new MiddlewareLogger();
    this.client = new WebClient(TOKEN);
    this.middleware = [];
    this.events = [];
    this.interactions = [];
    this.cache = CACHE;

    // TODO(parley): I don't think we need this anymore
    // is there some advantage to precache-ing all the components
    components
      .map((component) => ({
        component,
        name: component.name,
      }))
      .reduce(
        (cache, {component, name}) => cache.set(name, component),
        this.components,
      );

    logger.log('component', this.components);
  }

  start() {
    console.log('yo yo');
    const app = createHttpServer(this.init());

    logger.log('init %s %s', this.ip, this.port, this.components);

    const server = app.listen(this.port, () => {
      this.logger.log(
        `Started dialog-serverfff on ${this.ip || DEFAULT_IP}:${
          this.port || DEFAULT_PORT
        }.`,
      );
    });

    this.stop = server.close.bind(server);
  }

  /**
   * Register a new middleware, processed in the order registered.
   *
   * @param middleware global middleware function
   */
  use(middleware: Middleware | Middleware[]) {
    const middlewareArray = Array.isArray(middleware)
      ? middleware
      : [middleware];

    middlewareArray.forEach((fn) => this.middleware.push(fn));

    return this;
  }

  stop: () => void = () => {};

  home(component, options?: HomeOptions) {
    const componentCacheKey = component.name;
    this.components.set(componentCacheKey, component);

    this.events.push(async (ctx, next) => {
      // TODO(parley): Some events enum exist somewhere?
      ctx.adapters?.events.on('app_home_opened', (payload: any) => {
        const {onlyOpen} = options || {onlyOpen: true};

        if (payload.tab !== 'home' && onlyOpen) {
          return;
        }

        const cacheKey = generateCacheKey(payload);
        const cachedView = this.cache.get(cacheKey);

        const renderHome = async (state) => {
          const useState = this.createUseState({state});
          const useModal = this.createUseModal({
            // TODO: rename to parentId?
            cacheKey: componentCacheKey,
          });

          const view = await render(
            React.createElement(component, {
              useState,
              useModal,
              user: payload.user,
              client: this.client,
              ...options,
            }),
          );

          if (!view) {
            throw new DialogError({
              title: 'Missing home markup',
              content: 'You returned undefined from the home callback.',
            });
          }

          let response: any;
          try {
            response = await this.client.views.publish({
              view,
              user_id: payload.user,
            });
          } catch (error) {
            logger.log('home update error', error);
          }

          const newCacheKey = response.view.id;

          return this.cache.set(newCacheKey, {
            props: {user: payload.user},
            name: component.name,
            state,
            view,
            id: response.view.id,
            type: 'home',
          });
        };

        if (!cachedView) {
          const state = {};

          logger.log('render');

          return renderHome(state);
        }

        logger.log('update', cachedView.state);
        return renderHome(cachedView.state);
      });

      if (next) {
        await next();
      }
    });
  }

  shortcut(id, renderFunction) {
    logger.log('shortcut', id);

    this.interactions.push((ctx, next) => {
      ctx.adapters?.interactions.shortcut(
        {callbackId: id, type: 'shortcut'},
        (payload) => {
          logger.log('handle callback for shortcut', id);

          const [nodes] = reconcile(renderFunction(payload));

          this.client.views.open({
            token: TOKEN,
            trigger_id: payload.trigger_id,
            view: nodes,
          });
        },
      );

      if (next) {
        next();
      }
    });
  }

  // TODO(parley): Add a contraint here
  submission() {
    logger.log('submission');

    // TODO(parley): make an Add Interaction helper?
    this.interactions.push(async (ctx, next) => {
      ctx.adapters?.interactions.viewSubmission(
        new RegExp(/.*/),
        async (payload) => {
          logger.log('handle callback for submission', payload);

          const cacheKey = generateCacheKey(payload);
          const cachedView = this.cache.get(cacheKey);

          if (!cachedView) {
            // We don't need to respond with anything
            // users can still do action stuff with server.action
            throw new Error(`No previous state for ${cacheKey}.`);
          }

          const parentCacheKey = cachedView.invokerKey || '';
          const cachedParentView = this.cache.get(parentCacheKey);

          if (!cachedParentView) {
            // We don't need to respond with anything
            // users can still do action stuff with server.action
            throw new Error(`No previous state for ${parentCacheKey}.`);
          }

          const useState = this.createUseState(cachedParentView);

          const executedCallbacks = new Map<string, boolean>();
          const executionPromises = new Array<Promise<any>>();

          function useModal(
            key: string,
            _modal: DialogMessage,
            onSubmit?: (event: SubmitEvent) => Promise<void>,
            onCancel?: (event: InteractionEvent) => Promise<void>,
          ): (title: string, props?: any) => Promise<void> {
            if (key === cachedView?.modalKey && !executedCallbacks.get(key)) {
              executedCallbacks.set(key, true);

              if (payload.type === 'view_submission') {
                const form = Object.keys(payload.view.state.values)
                  .map((key) => [
                    key,
                    Object.keys(payload.view.state.values[key])[0],
                  ])
                  .map(([key, action]) => {
                    const data = payload.view.state.values[key][action];

                    if (data.type === 'datepicker') {
                      return [action, data.selected_date];
                    }

                    if (
                      data.type === 'checkboxes' ||
                      data.type === 'multi_static_select' ||
                      data.type === 'multi_external_select'
                    ) {
                      const selected = data.selected_options.map(
                        (option: any) => option.value,
                      );

                      return [action, selected];
                    }

                    if (data.type === 'multi_users_select') {
                      return [action, data.selected_users];
                    }

                    if (data.type === 'multi_channels_select') {
                      return [action, data.selected_channels];
                    }

                    if (data.type === 'multi_conversations_select') {
                      return [action, data.selected_conversations];
                    }

                    if (
                      data.type === 'radio_buttons' ||
                      data.type === 'static_select' ||
                      data.type === 'external_select'
                    ) {
                      return [action, data.selected_option.value];
                    }

                    if (data.type === 'users_select') {
                      return [action, data.selected_user];
                    }

                    if (data.type === 'conversations_select') {
                      return [action, data.selected_conversation];
                    }

                    if (data.type === 'channels_select') {
                      return [action, data.selected_channel];
                    }

                    return [action, data.value];
                  })
                  .reduce((form, [action, value]) => {
                    form[action] = value;
                    return form;
                  }, {} as any);

                if (onSubmit) {
                  executionPromises.push(onSubmit({form, user: payload.user}));
                }
              } else {
                // eslint-disable-next-line no-lonely-if
                if (onCancel) {
                  executionPromises.push(onCancel({user: payload.user}));
                }
              }
            }

            return () => Promise.resolve();
          }

          await render(
            React.createElement(
              this.components.get(cachedParentView.name) as any,
              {
                useState,
                props: cachedParentView.props,
                useModal,
                user:
                  cachedParentView.type === 'home' ? payload.user : undefined,
                client: this.client,
              },
            ),
          );

          await Promise.all(executionPromises);

          const view = await render(
            React.createElement(
              this.components.get(cachedParentView.name) as any,
              {
                useState,
                props: cachedParentView.props,
                useModal,
                user:
                  cachedParentView.type === 'home' ? payload.user : undefined,
                client: this.client,
              },
            ),
          );

          switch (cachedParentView.type) {
            case 'message':
              await this.client.chat.update({
                ...view,
                channel: cachedParentView.id,
                ts: cachedParentView.ts,
              });
              break;
            case 'home':
              await this.client.views.update({
                view_id: parentCacheKey,
                view,
              });
              break;
            case 'modal':
              await this.client.views.update({
                view_id: cacheKey,
                view,
              });
              break;
          }

          this.cache.set(parentCacheKey, {...cachedParentView, view});
        },
      );

      if (next) {
        await next();
      }
    });
  }

  option() {
    this.interactions.push(async (ctx, next) => {
      ctx.adapters?.interactions.action(
        {type: 'block_suggestion'},
        this.processOption.bind(this),
      );
      ctx.adapters?.interactions.options(
        new RegExp(/.*/),
        this.processOption.bind(this),
      );

      if (next) {
        await next();
      }
    });
  }

  action(renderFunction) {
    this.interactions.push(async (ctx, next) => {
      ctx.adapters?.interactions.action(new RegExp(/.*/), async (payload) => {
        renderFunction(payload);

        const cacheKey = generateCacheKey(payload);
        const cachedView = this.cache.get(cacheKey);

        if (!cachedView) {
          throw new DialogError({
            title: 'Missing state',
            content: `No previous state for ${cacheKey}.`,
          });
        }

        const useState = this.createUseState(cachedView);
        const useModal = this.createUseModal({
          triggerId: payload.trigger_id,
          cacheKey,
        });

        for (const action of payload.actions) {
          await render(
            React.createElement(this.components.get(cachedView.name) as any, {
              useState,
              props: cachedView.props,
              useModal,
              user: cachedView.type === 'home' ? payload.user : undefined,
              client: this.client,
            }),
            {
              value: action.action_id,
              event: generateEvent(action, payload.user),
              type: 'interaction',
            },
          );
        }

        const view = await render(
          React.createElement(this.components.get(cachedView.name) as any, {
            useState,
            props: cachedView.props,
            useModal,
            user: payload.user,
            client: this.client,
          }),
        );

        switch (cachedView.type) {
          case 'message':
            await this.client.chat.update({
              ...view,
              channel: cachedView.id,
              ts: cachedView.ts,
            });
            break;
          case 'home':
            await this.client.views.update({
              view_id: cacheKey,
              view,
            });
            break;
          case 'modal':
            await this.client.views.update({
              view_id: cacheKey,
              view: {
                ...view,
                notify_on_close: true,
              },
            });
            break;
        }

        this.cache.set(cacheKey, {...cachedView, view});
      });

      if (next) {
        await next();
      }
    });
  }

  async message<p>(component: DialogMessage<p>, options: MessageOptions) {
    const componentCacheKey = component.name;
    this.components.set(componentCacheKey, component);

    const state = {};
    const useState = this.createUseState({state});
    const useModal = this.createUseModal({
      // TODO: rename to parentId?
      cacheKey: componentCacheKey,
    });

    const view = await render(
      React.createElement(component, {
        useState,
        useModal,
        client: this.client,
        ...options,
      }),
    );

    const response = await this.client.chat.postMessage({
      ...view,
      channel: options.channel,
    });

    const messageKey = `${response.channel}:${response.ts}`;

    this.cache.set(messageKey, {
      props: options,
      name: componentCacheKey,
      state,
      type: 'message',
      view,
      id: response.channel as string,
      ts: response.ts as string,
    });
  }

  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   */

  init() {
    const combinedMiddleware = compose([
      ...this.middleware,
      bindAdapterToMiddleware(
        'events',
        createEventAdapter(SLACK_SIGNING_SECRET),
        this.events,
      ),
      bindAdapterToMiddleware(
        'interactions',
        createMessageAdapter(SLACK_SIGNING_SECRET, {
          syncResponseTimeout: 3000,
        }),
        this.interactions,
      ),
      route('/ping', (ctx: Context) => {
        ctx.response.end('PONG');
      }),
    ]);

    const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, combinedMiddleware);
    };

    return handleRequest;
  }

  processOption(payload: any) {
    logger.log('process option', payload);
  }

  /**
   * Handle request in callback.
   *
   */

  async handleRequest(ctx: Context, middleware: Middleware) {
    try {
      await middleware(ctx, noopNext);
    } catch (error) {
      // swallow
    }
  }

  /**
   * Initialize a new context.
   *
   */
  createContext(req: IncomingMessage, res: ServerResponse): Context {
    // TODO(parley) can we infer the protocol from something in the request
    const protocol = 'https://';
    const url = `${protocol}${req.headers.host}${req.url}`;

    return {
      app: this,
      url: new URL(url),
      request: req,
      response: res,
    };
  }

  /**
   * Default error handler.
   *
   * @param {Error} err
   * @api private
   */

  onerror(err: Error) {
    // TODO(parley) Hook in slack errors here
    if (!(err instanceof Error)) {
      throw new TypeError(util.format('non-error thrown: %j', err));
    }

    const msg = err.stack || err.toString();

    this.logger.log(msg.replace(/^/gm, '  '));
  }

  private createUseState(view?: {state: State}) {
    return function useState<t>(
      key: string,
      initialValue?: t,
    ): [t, (value: t) => void] {
      const [initial, setState] = React.useState(initialValue);
      const current = view && view.state[key];

      if (view) {
        view.state[key] = current || initial;
      }

      return [
        current || initial,
        (newValue: t): void => {
          if (view) {
            view.state[key] = newValue;
          }

          setState(newValue);
        },
      ];
    };
  }

  private createUseModal({triggerId, cacheKey}: ModalOptions) {
    return (key: string, component: DialogModal) => {
      return async (props?: any) => {
        const state = {};
        const useState = this.createUseState({state});

        const view = await render(
          React.createElement(component, {useState, ...props}),
        );

        const response: any = await this.client.views.open({
          trigger_id: triggerId || '',
          view: {
            ...view,
            notify_on_close: true,
          },
        });

        const messageCacheKey = response.view.id;

        this.cache.set(messageCacheKey, {
          view,
          modalKey: key || '',
          invokerKey: cacheKey,
          name: component.name,
          props,
          state,
          type: 'modal',
          id: messageCacheKey,
        });
      };
    };
  }
}

function generateCacheKey(payload: any) {
  if (payload?.view?.id) {
    return payload.view.id;
  }

  if (payload.container) {
    const {channel_id, message_ts, view_id, type} = payload.container;
    return type === 'view' ? view_id : `${channel_id}:${message_ts}`;
  }
}
interface State {
  [key: string]: any;
}

interface ModalOptions {
  triggerId?: string;
  cacheKey: string;
}

function bindAdapterToMiddleware(
  key: string,
  adapter: any,
  middleware: Middleware[],
) {
  const composedMiddleware = compose([
    async (ctx, next) => {
      ctx.adapters = ctx.adapters || {};
      ctx.adapters[key] = adapter;

      if (next) {
        await next();
      }

      const listener = ctx.adapters[key].requestListener();

      return listener(ctx.request, ctx.response);
    },
    ...middleware,
  ]);

  return runIf(pathMatches(`/${key}`), composedMiddleware);
}
