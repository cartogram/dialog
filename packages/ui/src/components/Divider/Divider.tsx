import React from 'react';
import {DividerBlock} from '@slack/web-api';

/**
 * A content divider, like an hr, to split up different blocks inside of a
 * message. The divider block is nice and neat.
 *
 * Available in surfaces: Modals, Messages, Home tabs
 */
export function Divider() {
  return (
    <component
      componentType="divider"
      transform={(): DividerBlock => ({type: 'divider'})}
    />
  );
}
