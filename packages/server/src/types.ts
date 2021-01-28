import {IncomingMessage, ServerResponse} from 'http';

/**
 * Takes a koa Context object and returns some value derived from it.
 * This is useful when a user needs to dynamically define an option for
 * a middleware based on the incoming context object for that request.
 */
export interface ValueFromContext<T> {
  (ctx: Context): T;
}

/**
 * Koa next function
 */
export type NextFunction = () => Promise<void>;

export type Middleware<CustomizeContext extends Context = Context> = (
  context: CustomizeContext,
  next: NextFunction,
) => void | Promise<void>;

export enum EventType {
  Event,
  Action,
  Command,
  Options,
  ViewAction,
  Shortcut,
}

export interface Context {
  app: any;
  url: URL;
  request: IncomingMessage;
  response: ServerResponse;
  payload?: any;
  adapters?: {[key: string]: any};
}

export type UseModal = (
  key: string,
  modal: DialogModal,
  onSubmit?: (event: SubmitEvent) => void | Promise<void>,
  onCancel?: (event: InteractionEvent) => void | Promise<void>,
) => (props?: any) => Promise<void>;

export type UseState = <t = any>(
  key: string,
  initialValue?: t,
) => [t, (value: t) => void];

export interface DialogMessageProps<p = never> {
  /** The props for the component */
  props?: p;

  /** A hook to create some state for a component */
  useState: UseState;

  /** A hook to create a modal for a component */
  useModal: UseModal;
  client: any;
}

export type DialogMessage<P = any> = (
  props: DialogMessageProps<P>,
) => JSX.Element;

export type DialogModal<P = any> = (props: DialogModalProps<P>) => JSX.Element;
export type DialogModalProps<P = any> = Omit<DialogMessageProps<P>, 'useModal'>;

export interface InteractionEvent {
  /** A user the event is associated with */
  user: SlackUser;
}

export interface SubmitEvent extends InteractionEvent {
  /** The object constructed by the form */
  form: {[key: string]: any};
}

export interface SlackUser {
  /** Unique identifier for the slack user */
  id: string;

  /** The user name of the slack user */
  username: string;

  /** The user name of the slack user */
  name: string;

  /** The team the user is associated with */
  team_id: string;
}

/**
 * A function used to send message updates after an action is handled. This function can be used
 * up to 5 times in 30 minutes.
 *
 * @param message - a [message](https://api.slack.com/docs/interactive-message-field-guide#top-level_message_fields).
 *   Dialog submissions do not allow `replace_original: false` on this message.
 * @returns there's no contract or interface for the resolution value, but this Promise will resolve when the HTTP
 *   response from the `response_url` request is complete and reject when there is an error.
 */
declare type Respond = (message: any) => Promise<unknown>;

export type ActionHandler = (
  payload: any,
  respond: Respond,
) => any | Promise<any> | undefined;

/**
 * A handler function for global shortcuts.
 */
export type ShortcutHandler = (payload: any) => any | Promise<any> | undefined;

/**
 * A handler function for menu options requests.
 *
 * @param payload - an object describing
 *   [the state of the menu](https://api.slack.com/docs/message-menus#options_load_url)
 * @returns an [options list](https://api.slack.com/docs/interactive-message-field-guide#option_fields) or
 *   [option groups list](https://api.slack.com/docs/interactive-message-field-guide#option_groups). When the menu is
 *   within an interactive message, (`within: 'interactive_message'`) the option keys are `text` and `value`. When the
 *   menu is within a dialog (`within: 'dialog'`) the option keys are `label` and `value`. When the menu is within a
 *   dialog (`within: 'block_actions'`) the option keys are a text block and `value`. This function may also return a
 *   Promise either of these values. If a Promise is returned and it does not complete within 3 seconds, Slack will
 *   display an error to the user. If there is no return value, then the user is shown an empty list of options.
 */
export type OptionsHandler = (payload: any) => any | Promise<any> | undefined;

/**
 * A handler function for view submission requests.
 */
export type ViewSubmissionHandler = (
  payload: any,
) => any | Promise<any> | undefined;

/**
 * A handler function for view closed requests.
 */
export type ViewClosedHandler = (payload: any) => void;
