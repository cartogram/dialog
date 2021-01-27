import React from 'react';
import {ActionsBlock} from '@slack/web-api';

import {DialogChildren} from '../../types';

interface Props {
  children?: DialogChildren;
}

export function Actions(props: Props) {
  return (
    <component
      {...props}
      componentType="section"
      transform={(): ActionsBlock => ({
        type: 'actions',
        elements: [],
      })}
    />
  );
}
