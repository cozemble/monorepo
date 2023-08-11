import { PDFDocument, rgb as rgbFn } from 'pdf-lib'
import { parse } from 'lambda-multipart-parser'
import fs from 'fs'

export async function processPDF(event: any) {
  const result = await parse(event)
  console.log('Parsed result:', result)

  const file = result.files[0]
  const rectangles = JSON.parse(result.rectangles.toString())

  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No file uploaded' }),
    }
  }

  try {
    const uploadedFile = Buffer.from(file.content.toString(), 'base64')
    fs.writeFileSync('test.pdf', uploadedFile)

    const modifiedPDFBytes = await applyPdfMasking(uploadedFile, rectangles)
    fs.writeFileSync('test-modified.pdf', modifiedPDFBytes)
    const modifiedPDFBase64 = modifiedPDFBytes.toString('base64')
    fs.writeFileSync('test-modified-base64.pdf', modifiedPDFBase64)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: modifiedPDFBase64,
    }
  } catch (error: any) {
    console.error('Error processing the PDF:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing the PDF: ' + error.message }),
    }
  }
}

async function applyPdfMasking(pdfFile: any, rectangles: any): Promise<any> {
  const pdfDoc = await PDFDocument.load(pdfFile)
  const pages = pdfDoc.getPages()

  for (const rect of rectangles) {
    const { x, y, width, height, startPage, endPage, rgb } = rect

    for (let i = startPage - 1; i < endPage; i++) {
      if (i < pages.length) {
        pages[i].drawRectangle({
          x: x,
          y: y,
          width: width,
          height: height,
          color: rgb ? rgbFn(rgb[0], rgb[1], rgb[2]) : rgbFn(1, 1, 1), // Default to white if no rgb provided
        })
      }
    }
  }
  return await pdfDoc.save()
}
