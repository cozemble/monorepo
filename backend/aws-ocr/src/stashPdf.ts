import { parse } from 'lambda-multipart-parser'
import * as AWS_S3 from '@aws-sdk/client-s3'
import { mandatory, uuids } from '@cozemble/lang-util'
import { PDFDocument } from 'pdf-lib'
import { StashPdfResponse } from '@cozemble/backend-aws-ocr-types'

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

export function s3KeyForPage(s3Parent: string, pageNumber: number): string {
  return `${s3Parent}/page${pageNumber}.pdf`
}

export async function stashPdf(event: any) {
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

    const pdfId = uuids.v4()
    const s3Parent = `pdfs/${pdfId}`
    const s3Key = `${s3Parent}/${mandatory(file.filename, 'FILENAME')}`
    await uploadToS3(bucketName, s3Key, file.content)
    console.log(`File uploaded to S3: s3://${bucketName}/${s3Key}`)

    const pdfDoc = await PDFDocument.load(file.content)
    const pageCount = pdfDoc.getPageCount()

    const pageS3Keys = []
    for (let i = 0; i < pageCount; i++) {
      const pageDoc = await PDFDocument.create()
      const [page] = await pageDoc.copyPages(pdfDoc, [i])
      pageDoc.addPage(page)

      const pagePdfBytes = await pageDoc.save()
      const pageS3Key = s3KeyForPage(s3Parent, i + 1)
      await uploadToS3(bucketName, pageS3Key, pagePdfBytes)
      console.log(`Page ${i + 1} uploaded to S3: s3://${bucketName}/${pageS3Key}`)
      pageS3Keys.push(pageS3Key)
    }

    const payload: StashPdfResponse = {
      pdfId,
      pageCount,
      s3Parent,
      pages: pageS3Keys.map((pdfS3Key) => ({ pdfS3Key })),
    }

    return {
      statusCode: 200,
      body: JSON.stringify(payload),
    }
  } catch (error: any) {
    console.error('Error uploading the PDF:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error uploading the PDF: ' + error.message }),
    }
  }
}
