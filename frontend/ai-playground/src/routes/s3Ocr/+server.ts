import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const fetch = event.fetch
  const json = await event.request.json()
  console.log({ json })
  const { s3Key } = json
  if (!s3Key) {
    return new Response('No s3Key provided', { status: 400 })
  }

  const apiKey = process.env.AWS_OCR_API_KEY
  const s3OcrUrl = process.env.S3_OCR_URL
  if (!s3OcrUrl) {
    console.log('No s3OcrUrl configured')
    return new Response('No s3OcrUrl configured', { status: 500 })
  }
  if (!apiKey) {
    console.log('No aws apiKey configured')
    return new Response('No aws apiKey configured', { status: 500 })
  }

  try {
    const response = await fetch(s3OcrUrl, {
      method: 'POST',
      body: JSON.stringify({ s3Key }),
      headers: {
        Authorization: apiKey,
      },
    })

    if (response.ok) {
      const result = await response.json()
      return new Response(JSON.stringify(result), { status: 200 })
    } else {
      const error = await response.text()
      return new Response(`Error from AWS OCR: ${error}`, { status: 500 })
    }
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}
