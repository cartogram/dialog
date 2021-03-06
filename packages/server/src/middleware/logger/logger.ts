import {Context, Request} from 'koa';
import chalk from 'chalk';

import {NextFunction} from '../../types';

export const LOGGER = Symbol('logger');

const PREFIX = chalk.underline('[Dialog Server] ');

export class Logger {
  buffer = '';
  private readonly logger = console;

  log(message: string) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      this.logger.log(`${PREFIX}${message}`);
    } else {
      this.buffer = `${this.buffer}\n${message}`;
    }
  }

  error(message: string) {
    this.logger.error(`${PREFIX}${message}`);
  }
}

export function setLogger(ctx: Context, logger: Logger) {
  (ctx.state as any)[LOGGER] = logger;
}

export function getLogger(ctx: Context): Logger {
  return (ctx.state as any)[LOGGER];
}

function initialRequestMessage(request: Request): string {
  const requestMethod = `${request.method.toUpperCase()} "${request.url}"`;
  return `Started ${requestMethod} at ${new Date().toISOString()}`;
}

function endRequestMessage(ctx: Context, requestDuration: number): string {
  const httpStatus = `${ctx.status} ${ctx.message || ''}`;
  const duration = `${requestDuration.toFixed(0)}ms`;

  return `Completed ${httpStatus} at ${new Date().toISOString()} in ${duration}`;
}

function endRequest(ctx: Context, requestDuration: number) {
  const logger = getLogger(ctx);
  logger.log(endRequestMessage(ctx, requestDuration));

  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const logObject: any = {
    datetime: new Date().toISOString(),
    http_method: ctx.method.toUpperCase(),
    http_response: ctx.message || '',
    http_status: ctx.status,
    uri: ctx.originalUrl,
    user_agent: ctx.header['User-Agent'],
    payload: logger.buffer,
  };

  logger.log(
    JSON.stringify(
      logObject,
      undefined,
      process.env.NODE_ENV === 'production' ? undefined : 2,
    ),
  );
}

function requestDuration(requestStartTime: [number, number]) {
  const duration = process.hrtime(requestStartTime);
  const ms = duration[0] * 1000 + duration[1] / 1e6;
  return Math.round(ms);
}

export function requestLogger(loggerModule?: Logger) {
  return async (ctx: Context, next: NextFunction) => {
    const requestStartTime = process.hrtime();
    setLogger(ctx, loggerModule || new Logger());

    const logger = getLogger(ctx);
    logger.log(initialRequestMessage(ctx.request));

    try {
      await next();
    } catch (error) {
      logger.log('Error during server execution, see details below.');
      logger.log(
        `${error.stack || error.message || 'No stack trace was present'}`,
      );
    } finally {
      endRequest(ctx, requestDuration(requestStartTime));
    }
  };
}
