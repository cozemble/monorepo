export interface HasuraError {
  extensions: {
    code: string
    path: string
  }
  message: string
}

export function modelLevelHasuraErrors(errors: HasuraError[]): string[] {
  return errors.map((e) => `${e.extensions.path}: ${e.message}`)
}
