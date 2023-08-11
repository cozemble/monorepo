import { parse } from 'lambda-multipart-parser'

export const handler = async (event: any) => {
  try {
    const result = await parse(event)

    // Extract the PDF and rectangles
    const pdfFile = result.files[0] // Assuming the PDF is the first file in the form
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
