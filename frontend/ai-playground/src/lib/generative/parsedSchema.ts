import type { JsonSchema } from '@cozemble/model-core'

export function parsedSchema(str: string): JsonSchema {
  return {
    ...JSON.parse(str),
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'generated-schema' + new Date().getTime(),
  }
}
