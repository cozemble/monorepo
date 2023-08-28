import { parse } from 'lambda-multipart-parser'
import { processPDF } from './pdfProcessor'
import { ocr } from './ocr'
import { Handler } from 'aws-lambda'
import { mandatory } from '@cozemble/lang-util'

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
    case '/prod/processPdf':
      return processPDF(event)
    case '/prod/echo':
      return handleEchoRoute(event)
    case '/prod/another-route':
      return handleAnotherRoute(event)
    default:
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Route not found' }),
      }
  }
}

const handleEchoRoute = async (event: any) => {
  try {
    const result = await parse(event)

    // Extract the PDF and rectangles
    const pdfFile = result.files[0]
    const rectangles = JSON.parse(result.rectangles)

    // Console log the rectangles
    console.log('Rectangles:', rectangles)

    // Return the PDF
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: pdfFile.content.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error) {
    console.error('Error processing the request:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing the request: ' + error.message }),
    }
  }
}

const handleAnotherRoute = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Response from another route' }),
  }
}
