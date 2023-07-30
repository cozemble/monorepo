import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const fetch = event.fetch
  const formData = await event.request.formData()
  const imageFile: any = formData.get('image')
  if (!imageFile) {
    return new Response('No image file provided', { status: 400 })
  }

  const apiKey = process.env.OCR_API_KEY
  const ocrUrl = process.env.OCR_URL
  if (!ocrUrl) {
    console.log('No ocr url configured')
    return new Response('No ocr url configured', { status: 500 })
  }
  if (!apiKey) {
    console.log('No apiKey configured')
    return new Response('No apiKey configured', { status: 500 })
  }

  try {
    const response = await fetch(ocrUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: apiKey,
      },
    })

    if (response.ok) {
      const result = await response.json()
      return new Response(JSON.stringify(result), { status: 200 })
    } else {
      const error = await response.text()
      return new Response(`Error from Google Cloud: ${error}`, { status: 500 })
    }
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}
