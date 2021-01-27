import React, {ReactElement} from 'react';

import {DialogChildren} from '../../types';

interface OptionGroupProps {
  /**
   * A plain_text only Text component that defines the label shown above this
   * group of options. Maximum length for the text in this field is 75 characters.
   */
  label: ReactElement | string;

  /**
   * An array of Option components that belong to this specific group. Maximum of 100 items.
   */
  children: DialogChildren;
}

/** Provides a way to group options in a select menu or multi-select menu. */
export function OptionGroup(props: OptionGroupProps) {
  return (
    <component
      {...props}
      componentType="option-group"
      transform={(props, reconcile, promises) => {
        const instance: any = {
          isOptionGroup: () => true,
          options: [],
        };

        const [label, labelPromises] = reconcile(props.label);

        instance.label = label;

        if (instance.label) {
          instance.label.type = 'plain_text';
        }

        promises.push(...labelPromises);

        return instance;
      }}
    />
  );
}
