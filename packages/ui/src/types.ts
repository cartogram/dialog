import {ReactElement} from 'react';

export enum SlackComponent {
  Overflow = 'overflow',
  Actions = 'actions',
  Button = 'button',
  Checkboxes = 'checkboxes',
  Confirm = 'confirm',
  Context = 'context',
  Divider = 'divider',
  Home = 'home',
  ImageBlock = 'image-block',
  Image = 'image',
  Input = 'input',
  Message = 'message',
  Modal = 'modal',
  MultiSelectMenu = 'multi-select-menu',
  OptionGroup = 'option-group',
  Option = 'option',
  RadioButtons = 'radio-buttons',
  Section = 'section',
  SelectMenu = 'select-menu',
  TextField = 'text-field',
  Text = 'text',
}
export type Instance = any;
export type TextInstance = any;
export type Container = any;

export type DialogChild =
  | string
  | false
  | null
  | undefined
  | ReactElement
  | ReactElement[];
export type DialogChildren = DialogChild | DialogChild[];
export interface InteractionEvent {
  /** A user the event is associated with */
  user: SlackUser;
}

export interface SlackUser {
  /** Unique identifier for the slack user */
  id: string;

  /** The user name of the slack user */
  username: string;

  /** The user name of the slack user */
  name: string;

  /** The team the user is associated with */
  team_id: string;
}

export interface SelectDateEvent extends InteractionEvent {
  /** The selected formatted date */
  date: string;
}

export interface SelectOptionEvent extends InteractionEvent {
  /** The selected Option value */
  selected: string;
}

export interface MultiSelectOptionEvent extends InteractionEvent {
  /** The selected Option values */
  selected: string[];
}

export interface SearchOptionsEvent extends InteractionEvent {
  /** The query for the typeahead */
  query: string;
}
