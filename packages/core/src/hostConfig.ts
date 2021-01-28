/**
 * https://medium.com/@agent_hunt/hello-world-custom-react-renderer-9a95b7cd04bc
 */
import ReactReconciler from 'react-reconciler';
import {Logger} from '@cartogram/dialog-logger';

import {Action} from './types';
import {finalizeInitialChildren} from './finalizeInitialChildren';
import {commitUpdate} from './commitUpdate';
import {appendInitialChild} from './appendInitialChild';
import {appendChildToContainer} from './appendChildToContainer';

export const hostConfig = {
  supportsMutation: true,
  prepareForCommit: noop,
  resetAfterCommit: noop,
  commitMount: noop,
  appendChildToContainer,
  appendChild: noop,
  removeChildFromContainer: noop,
  now: Date.now,
  prepareUpdate() {
    return true;
  },
  getRootHostContext: () => {
    return {type: 'root'};
  },
  getChildHostContext: () => {
    return {};
  },
  shouldSetTextContent: () => {
    return false;
  },
  insertBefore: noop,

  /**
   * This is where react-reconciler wants to create an instance of UI element in terms of the target.
   */
  createInstance(type, props, rootContainerInstance) {
    if (!props.transform) {
      throw Error(
        `Unknown Component type ${type}. Component requires a transform prop.`,
      );
    }

    if (typeof props.transform !== 'function') {
      throw Error(`transform prop must be a function`);
    }

    const transformCallback = (element) =>
      reconcile(element, rootContainerInstance.action);

    return props.transform(
      props,
      transformCallback,
      rootContainerInstance.promises,
    );
  },
  finalizeInitialChildren,
  createTextInstance: (text) => {
    return {
      type: 'text',
      text,
    };
  },
  appendInitialChild,
  commitUpdate,
  commitTextUpdate(textInstance, _oldText, newText) {
    textInstance.text = newText;
  },
  removeChild() {
    // parentInstance.removeChild(child);
  },
};

interface ReconcilerOptions {
  debug: boolean;
}

export function reconcile(
  element:
    | React.FunctionComponentElement<any>
    | React.ComponentElement<any, any>,
  action?: Action,
  options: ReconcilerOptions = {debug: false},
): [any, Promise<any>[]] {
  const config: any = options.debug ? trace(hostConfig) : hostConfig;
  const reconcilerInstance = ReactReconciler(config);
  const root: any = {
    isRoot: true,
    action,
    promises: new Array<Promise<any>>(),
  };
  const container = reconcilerInstance.createContainer(root, false, false);

  reconcilerInstance.updateContainer(element, container, null, () => {});

  return [root.node, root.promises];
}

function trace(hostConfig) {
  const logger = new Logger({prefix: 'Reconciler step::'});
  const traceWrappedHostConfig = {};

  Object.keys(hostConfig).map((key) => {
    const func = hostConfig[key];
    traceWrappedHostConfig[key] = (...args) => {
      logger.log(key, args);
      return func(...args);
    };
  });
  return traceWrappedHostConfig;
}

function noop() {}
