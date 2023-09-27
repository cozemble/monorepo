import { mandatory } from '@cozemble/lang-util'
import { validateOcrRequest } from '@cozemble/backend-aws-ocr-types'
import { AnalyzeDocumentCommandOutput, Textract } from '@aws-sdk/client-textract'
import { textractToJson } from './textractToJson'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { uploadToS3 } from './uploadToS3'

const textract = new Textract()
const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')

async function uploadTextractJson(s3Key: string, analysis: AnalyzeDocumentCommandOutput) {
  const lastDotIndex = s3Key.lastIndexOf('.')
  const fileNameWithoutExtension = s3Key.substring(0, lastDotIndex)
  await uploadToS3(
    bucketName,
    fileNameWithoutExtension + '-textract.json',
    JSON.stringify(analysis, null, 2),
  )
}

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
    await uploadTextractJson(s3Key, analysis)

    const blocks = analysis.Blocks ?? []
    const json = textractToJson(blocks)

    return {
      statusCode: 200,
      body: JSON.stringify({ json, s3Key }),
    }
  } catch (error: any) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}
