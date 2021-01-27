import React from 'react';
import {ContextBlock} from '@slack/web-api';

import {DialogChildren} from '../../types';

interface ContextProps {
  /** Child components to display within the Context */
  children: DialogChildren;
}

/**
 * https://api.slack.com/reference/block-kit/blocks#context
 *
 * Displays message context, which can include both images and text.
 *
 * Available in surfaces: Modals, Messages, Home
 */
export function Context(props: ContextProps) {
  return (
    <component
      {...props}
      componentType="context"
      transform={(): ContextBlock => ({type: 'context', elements: []})}
    />
  );
}
