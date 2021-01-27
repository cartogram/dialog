import React from 'react';
import {PlainTextElement, MrkdwnElement} from '@slack/web-api';

import {DialogChildren} from '../../types';

interface Props {
  children: DialogChildren;
}

type PlainTextProps = Props & {
  type?: 'plain_text';
  emoji?: boolean;
};

type MarkDownProps = Props & {
  type?: 'mrkdwn';
  verbatim?: boolean;
};

export function Text(props: PlainTextProps | MarkDownProps) {
  return (
    <component
      {...props}
      componentType="section"
      transform={(props): PlainTextElement | MrkdwnElement => {
        const type = props.type || 'plain_text';

        const instance: PlainTextElement | MrkdwnElement = {
          type,
          text: '',
        };

        switch (instance.type) {
          case 'plain_text':
            instance.emoji = true;
            break;
          case 'mrkdwn':
            instance.verbatim = props.verbatim;
            break;
        }

        return instance;
      }}
    />
  );
}
