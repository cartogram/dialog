import {IncomingMessage, ServerResponse} from 'http';

import {StatusCode} from '@shopify/network';

interface HandlerContext {
  req: IncomingMessage;
  res: ServerResponse;
}

export function ping({res}: HandlerContext) {
  res.writeHead(StatusCode.Ok);
  res.end('Pong');
}
