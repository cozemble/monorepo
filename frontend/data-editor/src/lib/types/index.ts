export interface JSONSchema {
  $id?: string
  $schema?: string
  $ref?: string
  $comment?: string
  title?: string
  description?: string

  properties?: Record<string, JSONSchema>
  items?: JSONSchema | JSONSchema[]
  additionalItems?: JSONSchema | boolean
  required?: string[]

  [key: string]: any
}
