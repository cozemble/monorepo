declare interface JSONSchema {
  $id?: string
  $schema?: string
  $ref?: string
  $comment?: string
  title?: string
  description?: string

  properties?: Record<string, JSONSchema>
  items?: JSONSchema | JSONSchema[]
  additionalItems?: JSONSchema | boolean
  type?: 'string' | 'number' | 'integer' | 'object' | 'array' | 'boolean' | 'null'
  required?: string[]

  /** To store Cozemble specific configurations */
  coz?: JSONSchemaCozembleConfigs

  [key: string]: any
}

declare type JSONObject<S extends JSONSchema> = S extends { type: 'object' }
  ? {
      [K in keyof S['properties']]: JSONObject<S['properties'][K]>
    }
  : S extends { type: 'array' }
  ? JSONArray<S['items']>
  : S extends { type: 'string' }
  ? string
  : S extends { type: 'number' }
  ? number
  : S extends { type: 'integer' }
  ? number
  : S extends { type: 'boolean' }
  ? boolean
  : S extends { type: 'null' }
  ? null
  : unknown
