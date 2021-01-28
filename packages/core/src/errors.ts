interface DialogErrorOptions {
  title?: string;
  content?: string;
  suggestion?: string;
}

const ID = Symbol.for('Dialog.DialogError');

export function isDialogError(value: unknown) {
  return Boolean((value as any)?.[ID]);
}

export class DialogError extends Error {
  readonly [ID] = true;
  readonly suggestion: DialogErrorOptions['suggestion'];
  readonly title: DialogErrorOptions['title'];
  readonly content: DialogErrorOptions['content'];

  constructor({title, content, suggestion}: DialogErrorOptions) {
    super(title);
    this.title = title;
    this.content = content;
    this.suggestion = suggestion;
  }
}
