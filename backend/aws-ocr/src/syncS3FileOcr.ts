import { mandatory } from '@cozemble/lang-util'
import { validateOcrRequest } from '@cozemble/backend-aws-ocr-types'
import { Textract } from '@aws-sdk/client-textract'
import { textractToJson } from './textractToJson'
import { APIGatewayProxyEvent } from 'aws-lambda'

const textract = new Textract()
const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')

export async function syncS3FileOcr(event: APIGatewayProxyEvent) {
  try {
    const posted = JSON.parse(event.body || '{}')
    if (!validateOcrRequest(posted)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request body' }),
      }
    }

    const { s3Key } = posted

    const analysis = await textract.analyzeDocument({
      Document: {
        S3Object: {
          Bucket: bucketName,
          Name: s3Key,
        },
      },
      FeatureTypes: ['TABLES'],
    })
    const blocks = analysis.Blocks ?? []
    const json = textractToJson(blocks)

    return {
      statusCode: 200,
      body: JSON.stringify({ json }),
    }
  } catch (error: any) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
