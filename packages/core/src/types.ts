export interface Action {
  /** The actions */
  value: string;

  /** The event for the action */
  event: InteractionEvent;

  /** The type of action */
  type?: 'interaction' | 'onload';
}

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

export type Type = 'component';

export interface Props {
  [key: string]: any;
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
