import { parse } from 'lambda-multipart-parser'
import * as AWS_S3 from '@aws-sdk/client-s3'
import { Textract } from '@aws-sdk/client-textract'
import { mandatory, uuids } from '@cozemble/lang-util'
import { textractToJson } from './textractToJson'
import { jsonToHtml } from './jsonToHtml'
import { uploadToS3 } from './uploadToS3'

const { S3 } = AWS_S3

const textract = new Textract()
const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')

export async function syncOcr(event: any) {
  const result = await parse(event)

  const file = result.files[0]

  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No file uploaded' }),
    }
  }
  const s3Parent = `ocr/${uuids.v4()}`
  const s3Key = `${s3Parent}/${mandatory(file.filename, 'FILENAME')}`
  await uploadToS3(bucketName, s3Key, file.content)
  console.log(`File uploaded to S3: s3://${bucketName}/${s3Key}`)

  try {
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
    const html = jsonToHtml(json)

    return {
      statusCode: 200,
      body: JSON.stringify({ json, html }),
    }
  } catch (error: any) {
    console.error('Error doing OCR on the file:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error doing OCR on the file: ' + error.message }),
    }
  }
}
