export class FileError extends Error {
  constructor (message: string, name?: string) {
    super(message)

    if (name) {
      this.name = name
    }
  }
}
