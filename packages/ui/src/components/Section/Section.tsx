import React, {ReactElement} from 'react';
import {SectionBlock} from '@slack/web-api';

interface Props {
  text?: React.ReactChild;
  accessory?: ReactElement;
  children?: React.ReactChild;
}

export function Section(props: Props) {
  return (
    <component
      {...props}
      componentType="section"
      transform={(props, reconcile, promises): SectionBlock => {
        const [accessory, accessoryPromises] = reconcile(props.accessory);
        const [text, textPromises] = reconcile(props.text);

        if (text && text.type === 'text') {
          text.type = props.type || 'plain_text';
        }

        if (text && text.type === 'plain_text') {
          text.emoji = props.emoji || false;
        }

        promises.push(...accessoryPromises, ...textPromises);

        return {
          type: 'section',
          accessory,
          text,
        };
      }}
    />
  );
}
