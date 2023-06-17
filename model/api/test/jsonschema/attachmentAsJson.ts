export const attachmentPropertyConfigurationSchema = {
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

export const attachmentPropertyDataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/attachment/data.json',
  definitions: {
    size: {
      type: 'object',
      properties: {
        width: { type: 'number' },
        height: { type: 'number' },
      },
      required: ['width', 'height'],
    },
    attachment: {
      type: 'object',
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
    },
  },
}

export const datePropertyConfigurationSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/date/configuration.json',
  type: 'object',
  properties: {
    format: {
      type: 'string',
    },
  },
}

export const datePropertyDataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/date/data.json',
  definitions: {
    date: {
      type: 'string',
    },
  },
}

export const timePropertyConfigurationSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/time/configuration.json',
  type: 'object',
  properties: {
    format: {
      type: 'string',
    },
  },
}

export const timePropertyDataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/types/time/data.json',
  definitions: {
    time: {
      type: 'string',
    },
  },
}

export const bikeCheckSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'Bike Check',
  properties: {
    customerId: {
      type: 'string',
    },
    dropOffDate: {
      $ref: 'https://cozemble.com/types/date/data.json#/definitions/date',
    },
    dropOffTime: {
      $ref: 'https://cozemble.com/types/time/data.json#/definitions/time',
    },
    make: {
      type: 'string',
    },
    model: {
      type: 'string',
    },
    pictures: { $ref: 'https://cozemble.com/types/attachment/data.json#/definitions/attachment' },
  },
}

export const exampleSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    myAttachment: {
      $ref: 'https://cozemble.com/types/attachment/data.json#/definitions/attachment',
    },
    myAttachments: {
      type: 'array',
      items: { $ref: '#/definitions/attachment' },
    },
  },
}

export const exampleData = {
  myAttachment: {
    attachmentId: 'attachment1',
    fileName: 'example1.txt',
    contentType: 'text/plain',
    sizeInBytes: 1024,
    size: {
      width: 800,
      height: 600,
    },
    thumbnailUrl: 'https://example.com/thumbnails/attachment1.jpg',
  },
  myAttachments: [
    {
      attachmentId: 'attachment2',
      fileName: 'example2.jpg',
      contentType: 'image/jpeg',
      sizeInBytes: 2048,
      size: {
        width: 1920,
        height: 1080,
      },
      thumbnailUrl: 'https://example.com/thumbnails/attachment2.jpg',
    },
    {
      attachmentId: 'attachment3',
      fileName: 'example3.png',
      contentType: 'image/png',
      sizeInBytes: 3072,
      size: {
        width: 1280,
        height: 720,
      },
      thumbnailUrl: 'https://example.com/thumbnails/attachment3.png',
    },
  ],
}
