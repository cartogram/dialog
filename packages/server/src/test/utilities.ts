import {Context} from 'koa';
import getPort from 'get-port';

import {NextFunction} from '../types';
import {DialogServer} from '../server';

interface MountOptions {
  port: number;
  ip: string;
}

export class TestRack {
  private readonly servers: DialogServer[] = [];

  unmountAll() {
    this.servers.forEach((server) => server.stop());
  }

  async mount(
    mountFunction: ({port, ip}: MountOptions) => DialogServer,
    options: RequestInit = {},
  ) {
    const port = await getPort();
    const ip = 'http://localhost';
    const server = mountFunction({port, ip});

    server.start();

    this.servers.push(server);

    return {
      request: (path = '') =>
        fetch(`${ip}:${port}${path}`, options).then((response) => response),
    };
  }
}

export async function mockMiddleware(_: Context, next: NextFunction) {
  await next();
}
