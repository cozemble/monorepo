import { parse } from 'lambda-multipart-parser'
import * as AWS_S3 from '@aws-sdk/client-s3'
import { mandatory, uuids } from '@cozemble/lang-util'
import { PDFDocument } from 'pdf-lib'

const { S3 } = AWS_S3

const s3 = new S3()
const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')

async function uploadToS3(
  bucketName: string,
  key: string,
  fileContent: Buffer | string | Uint8Array,
) {
  const params: AWS_S3.PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  }

  return s3.putObject(params)
}

export async function asyncOcr(event: any) {
  try {
    const result = await parse(event)

    const file = result.files[0]

    if (!file || file.contentType !== 'application/pdf') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid file type. Please upload a PDF file.' }),
      }
    }

    const fileContent = file.content
    if (!fileContent.slice(0, 5).equals(Buffer.from('%PDF-'))) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid file format. Please upload a valid PDF file.' }),
      }
    }

    const ocrId = uuids.v4()
    const s3Parent = `asyncOcr/${ocrId}`
    const s3Key = `${s3Parent}/${mandatory(file.filename, 'FILENAME')}`
    await uploadToS3(bucketName, s3Key, file.content)
    console.log(`File uploaded to S3: s3://${bucketName}/${s3Key}`)

    // Step 2: Split the PDF into individual pages
    const pdfDoc = await PDFDocument.load(file.content)
    const pageCount = pdfDoc.getPageCount()

    // Step 3: Create a new PDF for each page and upload it to S3
    for (let i = 0; i < pageCount; i++) {
      const pageDoc = await PDFDocument.create()
      const [page] = await pageDoc.copyPages(pdfDoc, [i])
      pageDoc.addPage(page)

      const pagePdfBytes = await pageDoc.save()
      const pageS3Key = `${s3Parent}/page${i + 1}.pdf`
      await uploadToS3(bucketName, pageS3Key, pagePdfBytes)
      console.log(`Page ${i + 1} uploaded to S3: s3://${bucketName}/${pageS3Key}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ocrId, pageCount }),
    }
  } catch (error: any) {
    console.error('Error uploading the PDF:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error uploading the PDF: ' + error.message }),
    }
  }
}
