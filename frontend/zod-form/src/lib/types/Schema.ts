export interface FormObject {
  type: 'object'
}

export interface FormArray {
  type: 'array'
  element: FormSchema
}

export interface FormRootArray {
  type: 'rootArray'
  itemName: string
  array: FormArray
}

export interface FormDiscriminatedUnion {
  type: 'discriminatedUnion'
  discriminator: string
  options: FormSchema
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
  value: string
}

export type FormSchema =
  | FormObject
  | FormArray
  | FormDiscriminatedUnion
  | FormLiteral
  | FormEnum
  | FormDefault
  | FormText

export type FormRootSchema = FormObject | FormRootArray
