type JsonSchemaProperty = {
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
  title?: string
  description?: string
  enum?: Array<string | number | boolean | null>
  properties?: Record<string, JsonSchemaProperty>
  items?: JsonSchemaProperty | JsonSchemaProperty[]
  required?: string[]
  additionalProperties?: boolean | JsonSchemaProperty
  format?: string
  $ref?: string
  oneOf?: JsonSchemaProperty[]
  anyOf?: JsonSchemaProperty[]
  allOf?: JsonSchemaProperty[]
  minimum?: number
  [key: string]: any
}

export type JsonSchema = {
  $schema: string
  $id: string
  type: 'object'
  properties: Record<string, JsonSchemaProperty>
  definitions?: Record<string, JsonSchemaProperty>
  required?: string[]
  additionalProperties?: boolean
  [key: string]: any
}

export const schemaFns = {
  findById(schemas: JsonSchema[], id: string): JsonSchema {
    const maybe = schemas.find((schema) => schema.$id === id)
    if (!maybe) {
      throw new Error(
        `Schema not found for id: ${id}, known schemas: ${schemas
          .map((schema) => schema.$id)
          .join(', ')}`,
      )
    }
    return maybe
  },
}
