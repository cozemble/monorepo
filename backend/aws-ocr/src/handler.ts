import { ocr } from './ocr'
import { Handler } from 'aws-lambda'
import { mandatory } from '@cozemble/lang-util'
import { asyncOcr } from './asyncOcr'

export const handler: Handler = async (event) => {
  const apiKey = mandatory(process.env.OCR_API_KEY, 'OCR_API_KEY')
  const auth = event.headers?.authorization
  if (auth === undefined) {
    console.log('No authorization header')
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    }
  }
  if (auth !== apiKey) {
    console.log('Invalid authorization header')
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    }
  }
  const path = event.path || event.requestContext?.http?.path

  switch (path) {
    case '/prod/ocr':
      return ocr(event)
    case '/prod/async/ocr':
      return asyncOcr(event)
    default:
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Route not found' }),
      }
  }
}
