export const handler = async (event: any) => {
  const pdfBuffer = Buffer.from(event.body, 'base64')

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: pdfBuffer.toString('base64'),
    isBase64Encoded: true,
  }
}
