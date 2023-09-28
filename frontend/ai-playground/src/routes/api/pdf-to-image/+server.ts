import { mandatory } from '@cozemble/lang-util'
import { error } from '@sveltejs/kit'

export async function POST({ request }) {
  const AWS_OCR_API_KEY = mandatory(process.env.AWS_OCR_API_KEY, 'AWS_OCR_API_KEY')
  const AWS_ENDPOINT_BASE = mandatory(process.env.AWS_ENDPOINT_BASE, 'AWS_ENDPOINT_BASE')
  const { pdfS3Key } = await request.json()
  if (!pdfS3Key) {
    throw error(400, 'Invalid request body - no pdfS3Key')
  }
  const convertToPngResponse = await fetch(`${AWS_ENDPOINT_BASE}/prod/img/convertToPng`, {
    method: 'POST',
    body: JSON.stringify({ s3Key: pdfS3Key }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: AWS_OCR_API_KEY,
    },
  })
  if (!convertToPngResponse.ok) {
    throw error(convertToPngResponse.status, 'Failed to convert PDF to PNG')
  }
  return new Response('OK', { status: 200 })
}
