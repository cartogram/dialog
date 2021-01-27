import React, {ReactElement, ReactNode} from 'react';

interface ModalProps {
  /** Array of Actions, Context, Divider, ImageBlock, Input, or Section components	 */
  children: ReactNode;

  /** The title of the modal. */
  title: ReactElement | string;

  /**
   * An optional plain_text Text component that defines the text displayed in the submit button
   * at the bottom-right of the view. submit is required when an input block is within the
   * blocks array. Max length of 24 characters.
   */
  submit?: ReactElement | string;

  /**
   * An optional plain_text Text component that defines the text displayed in the close button
   * at the bottom-right of the view. Max length of 24 characters.
   */
  close?: ReactElement | string;
}

/**
 * Modals provide focused spaces ideal for requesting and collecting data from users,
 * or temporarily displaying dynamic and interactive information.
 */
export function Modal(props: ModalProps) {
  return (
    <component
      {...props}
      componentType="modal"
      transform={(props, reconcile, promises) => {
        const instance: any = {
          type: 'modal',
          blocks: [],
        };

        const [title, titlePromises] = reconcile(props.title);
        const [submit, submitPromises] = reconcile(props.submit);
        const [close, closePromises] = reconcile(props.close);

        instance.title = title;
        instance.submit = submit;
        instance.close = close;

        if (instance.title) {
          instance.title.type = 'plain_text';
        }

        if (instance.submit) {
          instance.submit.type = 'plain_text';
        }

        if (instance.close) {
          instance.close.type = 'plain_text';
        }

        promises.push(...titlePromises, ...submitPromises, ...closePromises);

        return instance;
      }}
    />
  );
}
