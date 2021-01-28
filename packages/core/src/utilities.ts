import {
  InteractionEvent,
  MultiSelectOptionEvent,
  SelectDateEvent,
  SelectOptionEvent,
  SlackUser,
} from './types';

/** Convert an action to an event. */
export function generateEvent(
  action: any,
  user: SlackUser,
):
  | SelectDateEvent
  | InteractionEvent
  | MultiSelectOptionEvent
  | SelectOptionEvent {
  if (action.type === 'datepicker') {
    return {date: action.selected_date, user};
  }

  if (
    action.type === 'checkboxes' ||
    action.type === 'multi_static_select' ||
    action.type === 'multi_external_select'
  ) {
    return {
      selected: action.selected_options.map((option: any) => option.value),
      user,
    };
  }

  if (action.type === 'multi_users_select') {
    return {user, selected: action.selected_users};
  }

  if (action.type === 'multi_channels_select') {
    return {user, selected: action.selected_channels};
  }

  if (action.type === 'multi_conversations_select') {
    return {user, selected: action.selected_conversations};
  }

  if (action.type === 'users_select') {
    return {user, selected: action.selected_user};
  }

  if (action.type === 'conversations_select') {
    return {user, selected: action.selected_conversation};
  }

  if (action.type === 'channels_select') {
    return {user, selected: action.selected_channel};
  }

  if (
    action.type === 'overflow' ||
    action.type === 'radio_buttons' ||
    action.type === 'static_select' ||
    action.type === 'external_select'
  ) {
    return {user, selected: action.selected_option.value};
  }

  return {user};
}
