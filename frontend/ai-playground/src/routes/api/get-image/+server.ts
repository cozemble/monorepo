import { mandatory } from '@cozemble/lang-util'
import { error } from '@sveltejs/kit'
import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'

export async function GET(event: RequestEvent) {
  const AWS_OCR_API_KEY = mandatory(process.env.AWS_OCR_API_KEY, 'AWS_OCR_API_KEY')
  const AWS_ENDPOINT_BASE = mandatory(process.env.AWS_ENDPOINT_BASE, 'AWS_ENDPOINT_BASE')
  const s3Key = event.url.searchParams.get('s3key')
  if (!s3Key) {
    throw error(400, 'Invalid query - no s3Key')
  }
  const getImageResponse = await fetch(`${AWS_ENDPOINT_BASE}/prod/img/get?s3Key=${s3Key}`, {
    method: 'GET',
    headers: {
      Authorization: AWS_OCR_API_KEY,
    },
  })
  if (!getImageResponse.ok) {
    throw error(getImageResponse.status, 'Failed to get the image')
  }

  // Get the binary data
  const binaryData = await getImageResponse.arrayBuffer()

  // You may need to set the correct Content-Type for your binary data.
  const contentType = getImageResponse.headers.get('Content-Type') || 'application/octet-stream'

  return new Response(binaryData, {
    status: 200,
    headers: {
      'Content-Type': contentType,
    },
  })
}
