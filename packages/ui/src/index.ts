import React from 'react';

export * from './components';
export * from './types';
export * from './utilities';

/* eslint-disable line-comment-position */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type ComponentType =
      | 'actions' // ✓
      | 'button' // ✓
      | 'checkboxes' // ✖
      | 'confirm' // ✖
      | 'context' // ✖
      | 'divider' // ✖
      | 'home' // ✓
      | 'image-block'
      | 'image' // ✓
      | 'input' // ✓
      | 'message' // ✓
      | 'modal' // ✓
      | 'multi-select-menu' // ✖
      | 'option-group' // ✖
      | 'option' // ✖
      | 'overflow' // ✖
      | 'radio-buttons' // ✖
      | 'section' // ✖
      | 'select-menu' // ✖
      | 'text-field' // ✖
      | 'text'; // ✓

    type TransformFuncion = (
      props: any,
      reconcile: (
        element: React.FunctionComponentElement<any>,
      ) => [any, Promise<any>[]],
      promises: Promise<any>[],
    ) => any | ((props: any) => any);

    interface ComponentProps {
      componentType: ComponentType;
      transform: TransformFuncion;
    }

    interface IntrinsicElements {
      component: ComponentProps;
    }
  }
}
/* eslint-enable line-comment-position */
