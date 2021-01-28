import {Logger} from '@cartogram/dialog-logger';

interface Item {
  id: string;
  state: {[key: string]: any};
  view: string;
  name: string;
  ts?: string;
  props: any;
  type: 'home' | 'modal' | 'message';
  modalKey?: string;
  invokerKey?: string;
}

const logger = new Logger('dialog:cache');

export class DialogCache {
  private readonly cache: Map<string, Item> = new Map();

  set(key: string, item: Item) {
    logger.log('set (%s)', key, item);

    this.cache.set(key, item);

    return item;
  }

  get(key?: string) {
    if (!key) {
      return;
    }

    const item = this.cache.get(key);

    logger.log('get (%s)', key, item);

    return item;
  }

  clear() {
    this.cache.clear();
  }

  list() {
    const response: string[] = [];
    if (this.cache.size === 0) {
      logger.log('cache empty');
      return response;
    }
    for (const [item, value] of this.cache.entries()) {
      logger.log(item, value);
      response.push(`${item}: ${value}`);
    }

    return response;
  }

  get __MAP__() {
    return this.cache;
  }
}
