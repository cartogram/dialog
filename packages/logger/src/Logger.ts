import Debug from 'debug';

export class Logger {
  private readonly debug: Debug.IDebugger;

  constructor(options: string | {prefix: string}) {
    const normalizedOptions =
      typeof options === 'string' ? {prefix: options} : options;

    this.debug = Debug(`dialog:${normalizedOptions.prefix}`);
  }

  log(message: string, ...args: any[]) {
    this.debug(message, ...args);
  }
}
