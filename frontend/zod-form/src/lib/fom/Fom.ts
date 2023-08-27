export interface FomObject {
  type: 'object'
  properties: Record<string, FomSchema>
}

export interface FomArray {
  type: 'array'
  element: FomSchema
  itemName?: string
}

export interface FomDiscriminatedUnion {
  type: 'discriminatedUnion'
  discriminator: string
  options: FomSchema[]
}

export interface FomLiteral {
  type: 'literal'
  value: string
}

export interface FomEnum {
  type: 'enum'
  options: string[]
}

export interface FomDefault {
  type: 'default'
  value: any
  innerSchema: FomSchema
}

export interface FomText {
  type: 'text'
}

export type FomSchema =
  | FomObject
  | FomArray
  | FomDiscriminatedUnion
  | FomLiteral
  | FomEnum
  | FomDefault
  | FomText

export interface FomIssue {
  path: (string | number)[]
  message: string
}
