import i18n from '@src/i18n';

export class FileError extends Error {
  constructor (message: string, name?: string) {
    super(message); // Keep original message for internal logging if needed

    // If a name is provided, use it, otherwise use the translated default name.
    // The name property of an Error is typically a class name for the error.
    this.name = name || i18n.t('fileError.defaultName');
  }
}
