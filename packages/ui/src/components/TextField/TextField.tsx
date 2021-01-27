import React, {ReactElement} from 'react';
import {PlainTextInput} from '@slack/web-api';

interface TextFieldProps {
  /**
   * 	An identifier for the input value when the parent modal is submitted. You can use
   * this when you receive a view_submission payload to identify the value of the input
   * element. Should be unique among all other action_ids used elsewhere by your app. Maximum
   * length for this field is 255 characters.
   */
  action: string;

  /**	The initial value in the plain-text input when it is loaded. */
  initialValue?: string;

  /**
   * The maximum length of input that the user can provide. If the user provides more, they
   * will receive an error.
   */
  maxLength?: number;

  /**
   * The minimum length of input that the user must provide. If the user provides less,
   * they will receive an error. Maximum value is 3000.
   */
  minLength?: number;

  /**
   * Indicates whether the input will be a single line (false) or a larger textarea (true).
   *
   * @default false
   */
  multiline?: boolean;

  /**
   * A plain_text only Text component that defines the placeholder text shown in the plain-text
   * input. Maximum length for the text in this field is 150 characters.
   */
  placeholder?: ReactElement | string;
}

/**
 * A plain-text input, similar to the HTML input tag, creates a field where a user can
 * enter freeform data. It can appear as a single-line field or a larger textarea using
 * the multiline flag.
 *
 * Plain-text input elements are currently only available in modals. To use them, you will
 * need to make some changes to prepare your app. Read about preparing your app for modals.
 *
 * Works with block types: Section, Actions, Input
 * This function adds one to its input.
 * @param {number} input any number
 * @returns {number} that number, plus one.
 */
export function TextField(props: TextFieldProps) {
  return (
    <component
      {...props}
      componentType="text-field"
      transform={(props, reconcile, promises): PlainTextInput => {
        const instance: PlainTextInput = {
          type: 'plain_text_input',
          initial_value: props.initialValue,
          action_id: props.action,
          max_length: props.maxLength,
          min_length: props.minLength,
          multiline: props.multiline,
        };

        const [placeholder, placeholderPromises] = reconcile(props.placeholder);

        instance.placeholder = placeholder;

        if (instance.placeholder) {
          instance.placeholder.type = 'plain_text';
        }

        promises.push(...placeholderPromises);

        return instance;
      }}
    />
  );
}
