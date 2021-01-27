import {Option as SlackOption} from '@slack/web-api';
import React, {ReactElement} from 'react';

interface OptionProps {
  /**
   * A Text component that defines the text shown in the option on the menu. Overflow, select,
   * and multi-select menus can only use plain_text objects, while radio buttons and checkboxes
   * can use mrkdwn text objects. Maximum length for the text in this field is 75 characters.
   */
  children: ReactElement | string;

  /**
   * The string value that will be passed to your app when this option is chosen. Maximum
   * length for this field is 75 characters.
   */
  value: string;

  /**
   * A plain_text only Text component that defines a line of descriptive text shown below
   * the text field beside the radio button. Maximum length for the text object within this
   * field is 75 characters.
   */
  description?: ReactElement | string;

  /**
   * A URL to load in the user's browser when the option is clicked. The url attribute is only
   * available in overflow menus. Maximum length for this field is 3000 characters. If you're
   * using url, you'll still receive an interaction payload and will need to send an acknowledgement
   * response.
   */
  url?: string;

  /** Whether the Option is selected. */
  selected?: boolean;
}

/**
 * A component that represents a single selectable item in a select menu, multi-select menu,
 * checkbox group, radio button group, or overflow menu.
 */
export function Option(props: OptionProps) {
  return (
    <component
      {...props}
      componentType="option"
      transform={(props, reconcile, promises): Promise<SlackOption> => {
        const instance: any = {
          isSelected: () => props.selected,
          isOption: () => true,
          value: props.value,
          url: props.url,
        };

        const [description, descriptionPromises] = reconcile(props.description);

        instance.description = description;

        if (instance.description) {
          instance.description.type = 'plain_text';
        }

        promises.push(...descriptionPromises);

        return instance;
      }}
    />
  );
}
