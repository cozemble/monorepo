declare interface ArrayError {
  self?: string
  items?: (string | ArrayError | ObjectError)[]
}

declare type ObjectError = Record<string, string | ArrayError | ObjectError>

declare type ErrorObject =
  | {
      [key: string]: string | ArrayError | ObjectError
    }
  | Record<string, never>

declare type AnyError = string | ArrayError | ObjectError
