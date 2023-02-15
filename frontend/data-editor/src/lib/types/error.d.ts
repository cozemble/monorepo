declare interface ArrayError {
  self?: string
  items?: ArrayError[]
}

declare interface ObjectError {
  self?: string
  properties?: Record<string, string | ArrayError | ObjectError>
}

declare type ErrorObject =
  | {
      [key: string]: string | ArrayError | ObjectError
    }
  | Record<string, never>
