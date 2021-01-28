import {Container, Instance, TextInstance} from '@cartogram/dialog-ui';

export function appendChildToContainer(
  container: Container,
  child: Instance | TextInstance,
): void {
  if (container.isRoot) {
    container.node = child;
    return;
  }

  throw new Error('container is not an array');
}
