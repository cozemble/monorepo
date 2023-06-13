import type { JsonSchema } from '$lib/types/types'

export const datePropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/date/configuration.json',
  type: 'object',
  properties: {
    format: {
      type: 'string',
    },
  },
}

export const datePropertyDataSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/date/data.json',
  type: 'object',
  properties: {
    value: {
      type: 'string',
    },
  },
}

export const timePropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/time/configuration.json',
  type: 'object',
  properties: {
    format: {
      type: 'string',
    },
  },
}

export const timePropertyDataSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/time/data.json',
  type: 'object',
  properties: {
    value: {
      type: 'string',
    },
  },
}

export const emailPropertyDataSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/email/data.json',
  type: 'object',
  properties: {
    value: {
      type: 'string',
      format: 'email',
    },
  },
}

export const phonePropertyDataSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/phone/data.json',
  type: 'object',
  properties: {
    value: {
      type: 'string',
      pattern: '^[0-9\\-\\+\\(\\)\\s]+$', // eslint-disable-line no-useless-escape
    },
  },
}

export const referencePropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/reference/configuration.json',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    originModelId: {
      type: 'string',
    },
    referencedModelId: {
      type: 'string',
    },
    originCardinality: {
      type: 'string',
      enum: ['one', 'many'],
    },
    referencedCardinality: {
      type: 'string',
      enum: ['one', 'many'],
    },
    inverse: {
      type: 'boolean',
    },
  },
  required: ['id'],
}

export const referencePropertyDataSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/reference/data.json',
  type: 'object',
  properties: {
    reference: {
      type: 'null',
    },
  },
}

export const attachmentPropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/attachment/configuration.json',
  type: 'object',
  properties: {
    minAttachments: {
      oneOf: [{ type: 'number', minimum: 0 }, { type: 'null' }],
    },
    maxAttachments: {
      oneOf: [{ type: 'number', minimum: 0 }, { type: 'null' }],
    },
    accept: {
      oneOf: [{ type: 'string' }, { type: 'null' }],
    },
  },
}

export const attachmentPropertyDataSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/attachment/data.json',
  type: 'object',
  definitions: {
    size: {
      type: 'object',
      properties: {
        width: { type: 'number' },
        height: { type: 'number' },
      },
      required: ['width', 'height'],
    },
  },
  properties: {
    attachmentId: { type: 'string' },
    fileName: { type: 'string' },
    contentType: { type: 'string' },
    sizeInBytes: { type: 'number' },
    size: {
      oneOf: [{ $ref: '#/definitions/size' }, { type: 'null' }],
    },
    thumbnailUrl: {
      oneOf: [{ type: 'string', format: 'uri' }, { type: 'null' }],
    },
  },
  required: ['attachmentId', 'fileName', 'contentType', 'sizeInBytes'],
}

export const cozembleSchemas = [
  datePropertyConfigurationSchema,
  datePropertyDataSchema,
  timePropertyConfigurationSchema,
  timePropertyDataSchema,
  attachmentPropertyConfigurationSchema,
  attachmentPropertyDataSchema,
  referencePropertyConfigurationSchema,
  emailPropertyDataSchema,
  phonePropertyDataSchema,
]
