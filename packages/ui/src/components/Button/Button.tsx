import React from 'react';
import {Button as ButtonType} from '@slack/web-api';

interface Props {
  children?: React.ReactChild;
  primary?: boolean;
  destructive?: boolean;
  value?: string;
  url?: string;
  confirm?: React.ReactElement;
  onClick?: (event: any) => void | Promise<void>;

  /**
   * An unique identifier for this action.
   * Maximum length for this field is 255 characters.
   */
  action: string;
}

/**
 * https://api.slack.com/reference/block-kit/block-elements#button
 */
export function Button(props: Props) {
  return (
    <component
      {...props}
      componentType="section"
      transform={(props, reconcile, promises): ButtonType => {
        const [confirm, confirmPromises] = reconcile(props.confirm);

        promises.push(...confirmPromises);

        return {
          type: 'button',
          action_id: props.action,
          style: buttonStyle(props),
          url: props.url,
          text: {type: 'plain_text', text: ''},
          confirm,
        };
      }}
    />
  );
}

function buttonStyle({
  primary,
  destructive,
}: Pick<Props, 'primary' | 'destructive'>) {
  if (primary) {
    return 'primary';
  }

  if (destructive) {
    return 'danger';
  }
}
