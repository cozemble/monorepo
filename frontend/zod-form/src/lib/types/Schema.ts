export interface FormObject {
  type: 'object'
  properties: Record<string, FormSchema>
}

export interface FormArray {
  type: 'array'
  element: FormSchema
  itemName?: string
}

export interface FormDiscriminatedUnion {
  type: 'discriminatedUnion'
  discriminator: string
  options: FormSchema[]
}

export interface FormLiteral {
  type: 'literal'
  value: string
}

export interface FormEnum {
  type: 'enum'
  options: string[]
}

export interface FormDefault {
  type: 'default'
  value: any
  innerSchema: FormSchema
}

export interface FormText {
  type: 'text'
}

export type FormSchema =
  | FormObject
  | FormArray
  | FormDiscriminatedUnion
  | FormLiteral
  | FormEnum
  | FormDefault
  | FormText
