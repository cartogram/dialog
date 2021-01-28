/**
 * Happens for every component

 */

import {Type, Props} from './types';

type Instance = any;
type Container = any;
type HostContext = any;

export function finalizeInitialChildren(
  _parentInstance: Instance,
  _type: Type,
  props: Props,
  rootContainerInstance: Container,
  _hostContext: HostContext,
) {
  if (rootContainerInstance.action?.type === 'onload' && props.onLoad) {
    rootContainerInstance.promises.push(
      props.onLoad(rootContainerInstance.action.event),
    );

    return true;
  }
  // console.log(props, rootContainerInstance);

  if (
    rootContainerInstance.action &&
    props.action === rootContainerInstance.action.value
  ) {
    if (rootContainerInstance.getOnSearchOptions && props.onSearchOptions) {
      rootContainerInstance.onSearchOptions = props.onSearchOptions;
      return true;
    }

    if (props.onClick) {
      rootContainerInstance.promises.push(
        props.onClick(rootContainerInstance.action.event),
      );
    }

    if (props.onSubmit) {
      rootContainerInstance.promises.push(
        props.onSubmit(rootContainerInstance.action.event),
      );
    }

    if (props.onSelect) {
      rootContainerInstance.promises.push(
        props.onSelect(rootContainerInstance.action.event),
      );
    }
    // console.log(rootContainerInstance);

    return true;
  }

  return false;
}
