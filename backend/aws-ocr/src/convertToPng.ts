import * as AWS_S3 from '@aws-sdk/client-s3'
import { mandatory } from '@cozemble/lang-util'
import sharp from 'sharp'
import { uploadToS3 } from './stashPdf'
import { Readable } from 'stream'
import { exec } from 'child_process'
import { promisify } from 'util'
import { promises as fs } from 'fs'
import * as path from 'path'

const { S3 } = AWS_S3

const s3 = new S3()
const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })
    stream.on('error', reject)
    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
  })
}

export async function convertToPng(event: any) {
  try {
    const posted = JSON.parse(event.body || '{}')
    const { s3Key } = posted
    if (!s3Key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request body - no s3Key' }),
      }
    }

    // Fetch the image from S3
    const getObjectParams: AWS_S3.GetObjectCommandInput = {
      Bucket: bucketName,
      Key: s3Key,
    }
    const { Body, ContentType } = await s3.getObject(getObjectParams)
    if (!Body) {
      throw new Error('Failed to retrieve the image from S3')
    }

    const buffer = await streamToBuffer(Body as Readable)

    if (ContentType === 'application/pdf') {
      const parts = s3Key.split('/')
      const filename = parts[parts.length - 1]
      const convertedFilename = filename.replace(/\.[^.]+$/, '.png')
      const convertedKey = s3Key.replace(/\.[^.]+$/, '.png')
      const execAsync = promisify(exec)

      // Create temporary file paths
      const inputFilePath = path.join('/tmp', filename)
      const outputFilePath = path.join('/tmp', convertedFilename)

      // Write the PDF buffer to a temporary file
      await fs.writeFile(inputFilePath, buffer)

      // Execute Ghostscript command
      await execAsync(`/opt/bin/gs -sDEVICE=pngalpha -o ${outputFilePath} -r144 ${inputFilePath}`)

      // Read the converted PNG file
      const pngBuffer = await fs.readFile(outputFilePath)

      // Upload the PNG to S3
      await uploadToS3(bucketName, convertedKey, pngBuffer, 'image/png')
      console.log(`Converted PDF uploaded to S3: s3://${bucketName}/${convertedKey}`)

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'PDF converted successfully', s3Key: convertedKey }),
      }
    } else if (ContentType && ContentType.startsWith('image/')) {
      const pngBuffer = await sharp(buffer).png().toBuffer()
      const convertedKey = s3Key.replace(/\.[^.]+$/, '.png')
      await uploadToS3(bucketName, convertedKey, pngBuffer, 'image/png')
      console.log(`Converted image uploaded to S3: s3://${bucketName}/${convertedKey}`)

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Image converted successfully', s3Key: convertedKey }),
      }
    } else {
      throw new Error('Unsupported file type: ' + ContentType)
    }
  } catch (error: any) {
    console.error('Error converting the image:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error converting the image: ' + error.message }),
    }
  }
}

export async function getImage(event: any) {
  const { s3Key } = event.queryStringParameters
  console.log({ s3Key })
  try {
    if (!s3Key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid request body - no s3Key' }),
      }
    }

    // Try to fetch the image from S3
    const getObjectParams: AWS_S3.GetObjectCommandInput = {
      Bucket: bucketName,
      Key: s3Key,
    }

    const { Body, ContentType } = await s3.getObject(getObjectParams)

    const buffer = await streamToBuffer(Body as Readable)
    // Return the image with the appropriate content type
    return {
      statusCode: 200,
      headers: { 'Content-Type': ContentType },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (error: any) {
    console.error('Error retrieving the image:', error)
    if (error.Code === 'NoSuchKey') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Image not found', s3Key }),
      }
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving the image: ' + error.message, s3Key }),
    }
  }
}
