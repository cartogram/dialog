import {Instance, TextInstance, SlackComponent} from '@cartogram/dialog-ui';

/**
 * This function gives us another space to shape the JSON before rendering.
 * I don't know if we want to keep this or not. We can maybe just do everything
 * in the components them selves. Should probably build an app and see.
 * @param parentInstance
 * @param child
 */
export function appendInitialChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  if (Array.isArray(parentInstance.blocks)) {
    parentInstance.blocks.push(child);
    return;
  }

  if (parentInstance.type === SlackComponent.Overflow) {
    parentInstance.options.push(child);
    return;
  }

  if (
    parentInstance.type === 'static_select' ||
    parentInstance.type === 'multi_static_select'
  ) {
    if (child.isOptionGroup) {
      if (!Array.isArray(parentInstance.option_groups)) {
        parentInstance.option_groups = [];
      }

      parentInstance.option_groups.push(child);
      return;
    }

    if (!Array.isArray(parentInstance.options)) {
      parentInstance.options = [];
    }

    parentInstance.options.push({...child, url: undefined});
    return;
  }

  if (
    parentInstance.type === 'checkboxes' ||
    parentInstance.type === 'radio_buttons' ||
    parentInstance.isOptionGroup
  ) {
    parentInstance.options.push({...child, url: undefined});
    return;
  }

  if (parentInstance.type === 'input') {
    parentInstance.element = child;
    return;
  }

  if (parentInstance.type === 'actions') {
    parentInstance.elements.push(child);
    return;
  }

  if (parentInstance.type === 'context') {
    parentInstance.elements.push(child);
    return;
  }

  if (parentInstance.isConfirm || parentInstance.isOption) {
    parentInstance.text = child;

    if (parentInstance.text.type === 'text') {
      parentInstance.text.type = 'plain_text';
    }
    return;
  }

  if (parentInstance.type === 'button') {
    parentInstance.text.text += child.text;
    return;
  }

  if (parentInstance.type === 'section') {
    if (!parentInstance.fields) {
      parentInstance.fields = [];
    }

    parentInstance.fields.push(child);
    return;
  }

  if (
    parentInstance.type === 'mrkdwn' ||
    parentInstance.type === 'plain_text'
  ) {
    parentInstance.text += child.text;

    return;
  }

  if (parentInstance.type === child.type) {
    parentInstance.text += child.text;
    return;
  }

  throw new Error(
    `appendInitialChild::${JSON.stringify({parentInstance, child})}`,
  );
}
