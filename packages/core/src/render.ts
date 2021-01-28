import {Action} from './types';
import {reconcile} from './hostConfig';

export async function render(
  element:
    | React.FunctionComponentElement<any>
    | React.ComponentElement<any, any>,
  action?: Action,
) {
  const [blocks, promises] = reconcile(element, action);

  await Promise.all(promises);

  return blocks;
}
