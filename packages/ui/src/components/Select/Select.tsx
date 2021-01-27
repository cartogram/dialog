import React, {ReactElement} from 'react';

import {Section} from '../Section';
import {
  DialogChildren,
  SelectOptionEvent,
  SearchOptionsEvent,
} from '../../types';

/**
 * A select menu, just as with a standard HTML <select> tag, creates a drop down menu
 * with a list of options for a user to choose. The select menu also includes type-ahead
 * functionality, where a user can type a part or all of an option string to filter the list.
 *
 * There are different types of select menu that depend on different data sources for their lists of options:
 *
 * - Menu with static options
 * - Menu with external data source
 * - Menu with user list
 * - Menu with conversations list
 * - Menu with channels list
 *
 * Works with block types: Section, Actions, Input
 */

interface SelectMenuBase {
  /**
   * An identifier for the action triggered when a menu option is selected. You can
   * use this when you receive an interaction payload to identify the source of the
   * action. Should be unique among all other action_ids used elsewhere by your app.
   * Maximum length for this field is 255 characters.
   */
  action: string;

  /**
   * A plain_text only Text component that defines the placeholder text shown on
   * the menu. Maximum length for the text in this field is 150 characters.
   */
  placeholder: ReactElement | string;

  /**
   * A Confirm component that defines an optional confirmation dialog that
   * appears after a menu item is selected.
   */
  confirm?: ReactElement;

  /** Callback for when an option is selected */
  onSelect?: (event: SelectOptionEvent) => void | Promise<void>;
}

interface StaticSelectMenu extends SelectMenuBase {
  /** The type of the select */
  type: 'static';

  /** An array of Option components. Maximum number of options is 100. */
  children: DialogChildren;
}

interface UserSelectMenu extends SelectMenuBase {
  /** The type of the select */
  type: 'users';

  /** The user ID of any valid user to be pre-selected when the menu loads. */
  initialUser?: string;
}

interface ChannelSelectMenu extends SelectMenuBase {
  /** The type of the select */
  type: 'channels';

  /**	The ID of any valid public channel to be pre-selected when the menu loads. */
  initialChannel?: string;
}

export type SearchOptions = (
  event: SearchOptionsEvent,
) => ReactElement[] | Promise<ReactElement[]>;

interface ExternalSelectMenu extends SelectMenuBase {
  /** The type of the select */
  type: 'external';

  /**
   * A single option that exactly matches one of the options within the options
   * or option_groups loaded from the external data source. This option will
   * be selected when the menu initially loads.
   */
  initialOption?: ReactElement;

  /** Called when a user is search the menu options. Should return result options */
  onSearchOptions: SearchOptions;

  /**
   * 	When the typeahead field is used, a request will be sent on every character
   * change. If you prefer fewer requests or more fully ideated queries, use the
   * min_query_length attribute to tell Slack the fewest number of typed characters
   * required before dispatch.
   *
   * @default 3
   */
  minQueryLength?: number;
}

interface FilterOptions {
  /**
   * Indicates which type of conversations should be included in the list. When
   * this field is provided, any conversations that do not match will be excluded
   */
  include?: ('im' | 'mpim' | 'private' | 'public')[];

  /**
   * Indicates whether to exclude external shared channels from conversation lists
   *
   * @default false
   */
  excludeExternalSharedChannels?: boolean;

  /**
   * Indicates whether to exclude bot users from conversation lists.
   *
   * @default false
   */
  excludeBotUsers?: boolean;
}

interface ConversationSelectMenu extends SelectMenuBase {
  /** The type of the select */
  type: 'conversations';

  /** The ID of any valid conversation to be pre-selected when the menu loads. */
  initialConversation?: string;

  /**
   * A filter object that reduces the list of available conversations using the
   * specified criteria.
   */
  filter?: FilterOptions;
}

type SelectMenuProps =
  | ChannelSelectMenu
  | ConversationSelectMenu
  | ExternalSelectMenu
  | StaticSelectMenu
  | UserSelectMenu;

export function Select(props: SelectMenuProps) {
  return (
    <component
      {...props}
      componentType="select-menu"
      transform={(props, reconcile, promises) => {
        const instance: any = {
          type: `${props.type}_select`,
          action_id: props.action,
          onSearchOptions: props.onSearchOptions,
        };

        const [confirm, confirmPromises] = reconcile(props.confirm);
        const [placeholder, placeholderPromises] = reconcile(props.placeholder);
        const [{fields: optionsOrGroups}, optionPromises] = reconcile(
          // eslint-disable-next-line react/no-children-prop
          React.createElement(Section, {children: props.children}),
        );
        const [initialOption, initialOptionPromises] = reconcile(
          props.initialOption,
        );

        if (
          props.type === 'static' &&
          Array.isArray(optionsOrGroups) &&
          optionsOrGroups.length
        ) {
          const isGroup = Boolean(optionsOrGroups[0].isOptionGroup);
          let options = optionsOrGroups;

          if (isGroup) {
            options = optionsOrGroups.reduce((options, group) => {
              options.push(...group.options);
              return options;
            }, []);
          }

          const selectedOption = options
            .map((option) => ({
              ...option,
              url: undefined,
            }))
            .find((option) => option.isSelected());

          instance.initial_option = selectedOption;
        }

        if (props.type === 'external') {
          if (initialOption) {
            instance.initial_option = {...initialOption, url: undefined};
          }

          instance.min_query_length = props.minQueryLength;
        }

        if (props.type === 'users') {
          instance.initial_user = props.initialUser;
        }

        if (props.type === 'channels') {
          instance.initial_channel = props.initialChannel;
        }

        if (props.type === 'conversations') {
          instance.initial_conversation = props.initialConversation;

          if (props.filter) {
            instance.filter = {};
            instance.filter.include = props.filter.include;
            instance.filter.exclude_external_shared_channels =
              props.filter.excludeExternalSharedChannels;
            instance.filter.exclude_bot_users = props.filter.excludeBotUsers;
          }
        }

        instance.confirm = confirm;
        instance.placeholder = placeholder;

        if (instance.placeholder) {
          instance.placeholder.type = 'plain_text';
        }

        promises.push(
          ...confirmPromises,
          ...placeholderPromises,
          ...optionPromises,
          ...initialOptionPromises,
        );

        return instance;
      }}
    />
  );
}

Select.defaultProps = {
  type: 'static',
} as SelectMenuProps;
