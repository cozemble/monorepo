const consideration = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    googleDocument: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        url: { type: 'string', format: 'uri' },
      },
      required: ['documentId', 'url'],
    },
    office365Spreadsheet: {
      type: 'object',
      properties: {
        spreadsheetId: { type: 'string' },
        url: { type: 'string', format: 'uri' },
      },
      required: ['spreadsheetId', 'url'],
    },
    httpCall: {
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        url: { type: 'string', format: 'uri' },
        headers: { type: 'object' },
        body: { type: 'string' },
      },
      required: ['method', 'url'],
    },
    colorPicker: {
      type: 'string',
      pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$',
    },
    videoPlayer: {
      type: 'object',
      properties: {
        videoUrl: { type: 'string', format: 'uri' },
        format: { type: 'string' },
      },
      required: ['videoUrl'],
    },
    picture: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', format: 'uri' },
        altText: { type: 'string' },
      },
      required: ['imageUrl'],
    },
  },
  type: 'object',
  properties: {
    myGoogleDoc: { $ref: '#/definitions/googleDocument' },
    mySpreadsheet: { $ref: '#/definitions/office365Spreadsheet' },
    myHttpCall: { $ref: '#/definitions/httpCall' },
    myColor: { $ref: '#/definitions/colorPicker' },
    myVideo: { $ref: '#/definitions/videoPlayer' },
    myPicture: { $ref: '#/definitions/picture' },
  },
}
