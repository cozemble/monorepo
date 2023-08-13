import { parse } from 'lambda-multipart-parser'
import { S3, Textract } from 'aws-sdk'
import { mandatory, uuids } from '@cozemble/lang-util'

const textract = new Textract()
const s3 = new S3()

// Helper function to upload file to S3
async function uploadToS3(bucketName: string, key: string, fileContent: Buffer) {
  const params: S3.PutObjectRequest = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  }

  return s3.putObject(params).promise()
}

export async function ocr(event: any) {
  const result = await parse(event)
  console.log('Parsed result:', result)

  const file = result.files[0]

  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No file uploaded' }),
    }
  }
  console.log('Number of bytes:', file.content.length)

  // Upload the file to S3
  const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')
  const s3Key = `ocr/${uuids.v4()}/${mandatory(file.filename, 'FILENAME')}`
  await uploadToS3(bucketName, s3Key, file.content)
  console.log(`File uploaded to S3: s3://${bucketName}/${s3Key}`)

  try {
    const startResponse = await textract
      .startDocumentTextDetection({
        DocumentLocation: {
          S3Object: {
            Bucket: bucketName,
            Name: s3Key,
          },
        },
      })
      .promise()

    let finished = false
    let detectedTexts = [] as (string | undefined)[]

    while (!finished) {
      const response = await textract
        .getDocumentTextDetection({
          JobId: startResponse.JobId!,
        })
        .promise()

      if (response.JobStatus === 'SUCCEEDED') {
        finished = true
        detectedTexts =
          response.Blocks?.filter((block) => block.BlockType === 'LINE').map(
            (block) => block.Text,
          ) || []
      } else if (response.JobStatus === 'FAILED') {
        throw new Error('Textract processing failed')
      } else {
        // Wait for a short period before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ocrText: detectedTexts }),
    }
  } catch (error: any) {
    console.error('Error doing OCR on the file:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error doing OCR on the file: ' + error.message }),
    }
  }
}
