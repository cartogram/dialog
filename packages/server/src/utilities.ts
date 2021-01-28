import {Middleware, Context, NextFunction} from './types';

export async function noopNext() {}

/**
 * Conditionally run `middleware`
 *
 * @param {Function} condition
 * @param {Middleware} ifMiddleware
 * @param {Middleware} elseMiddleware
 * @return {Function}
 */
export function runIf<CustomContext extends Context>(
  condition: (ctx: CustomContext) => boolean | Promise<boolean>,
  ifMiddleware: Middleware<CustomContext>,
  elseMiddleware?: Middleware<CustomContext>,
): Middleware<CustomContext> {
  return async function conditionalMiddleware(
    ctx: CustomContext,
    next: NextFunction,
  ) {
    if (await condition(ctx)) {
      await ifMiddleware(ctx, next);
    } else if (elseMiddleware) {
      await elseMiddleware(ctx, next);
    } else {
      await next();
    }
  };
}

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 */
export function compose(middleware: Middleware[]): Middleware {
  if (!Array.isArray(middleware))
    throw new TypeError('Middleware stack must be an array!');
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1;

    return dispatch(0);

    function dispatch(i: number): any {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

export function pathMatches(path: string) {
  return (ctx: Context) => {
    const match = ctx.url.pathname === path;

    return match;
  };
}

export function route(path, middleware) {
  return compose([runIf(pathMatches(path), middleware)]);
}
