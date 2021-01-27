import React, {ReactElement} from 'react';

import {Section} from '../Section';
import {DialogChildren, SelectOptionEvent} from '../../types';

interface RadioButtonsProps {
  /**
   * An identifier for the action triggered when the radio button group is changed. You can
   * use this when you receive an interaction payload to identify the source of the action.
   * Should be unique among all other action_ids used elsewhere by your app. Maximum length
   * for this field is 255 characters.
   */
  action: string;

  /** Option component(s) */
  children: DialogChildren;

  /**
   * A Confirm component that defines an optional confirmation dialog that appears after clicking
   * one of the radio buttons in this element.
   */
  confirm?: ReactElement;

  /** A callback called once an Option is selected */
  onSelect?: (event: SelectOptionEvent) => void | Promise<void>;
}

/**
 * Radio buttons are only supported in the following app surfaces: Home tabs Modals
 *
 * A radio button group that allows a user to choose one item from a list of possible options.
 *
 * Works with block types: Section, Actions, Input
 */
export function RadioButton(props: RadioButtonsProps) {
  return (
    <component
      {...props}
      componentType="radio-buttons"
      transform={(props, reconcile, promises) => {
        const instance: any = {
          type: 'radio_buttons',
          action_id: props.action,
          options: [],
        };

        const markup = React.createElement(Section, {}, props.children);
        const [{fields: options}, optionPromises] = reconcile(markup);
        const [confirm, confirmPromises] = reconcile(props.confirm);

        if (Array.isArray(options)) {
          const selectedOption = options
            .map((option) => ({
              ...option,
              url: undefined,
            }))
            .find((option) => option.isSelected());

          instance.initial_option = selectedOption;
        }

        instance.confirm = confirm;

        promises.push(...optionPromises, ...confirmPromises);
        return instance;
      }}
    />
  );
}
