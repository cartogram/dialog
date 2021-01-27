import React, {ReactElement} from 'react';
import {InputBlock} from '@slack/web-api';

interface InputProps {
  /**
   * A label that appears above an input component in the form of a text component that must
   * have type of plain_text. Maximum length for the text in this field is 2000 characters.
   */
  label: string | ReactElement;

  /**
   * A plain-text input element, a select menu element, a multi-select menu element, or a datepicker.
   */
  children: ReactElement;

  /**
   * An optional hint that appears below an input element in a lighter grey. It must be a a text
   * component with a type of plain_text. Maximum length for the text in this field is 2000 characters.
   */
  hint?: string | ReactElement;

  /**
   * A boolean that indicates whether the input element may be empty when a user submits the modal.
   *
   * @default false
   */
  optional?: boolean;
}

/**
 * A block that collects information from users - it can hold a plain-text input element, a
 * select menu element, a multi-select menu element, or a datepicker.
 *
 * Read our guide to using modals to learn how input blocks pass information to your app.
 *
 * Available in surfaces: Modals
 */
export function Input(props: InputProps) {
  return (
    <component
      {...props}
      componentType="input"
      transform={(props, reconcile, promises): InputBlock => {
        const instance: any = {
          type: 'input',
          optional: props.optional,
        };

        const [hint, hintPromises] = reconcile(props.hint);
        const [label, labelPromises] = reconcile(props.label);

        instance.hint = hint;
        instance.label = label;

        if (instance.label) {
          instance.label.type = 'plain_text';
        }

        if (instance.hint) {
          instance.hint.type = 'plain_text';
        }

        promises.push(...hintPromises, ...labelPromises);

        return instance;
      }}
    />
  );
}
