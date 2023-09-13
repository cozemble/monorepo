import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const fetch = event.fetch
  const formData = await event.request.formData()
  const imageFile: any = formData.get('image')
  if (!imageFile) {
    return new Response('No image file provided', { status: 400 })
  }

  const apiKey = process.env.AWS_OCR_API_KEY
  const stashPdfUrl = process.env.STASH_PDF_URL
  if (!stashPdfUrl) {
    console.log('No stash pdf url configured')
    return new Response('No stash pdf url configured', { status: 500 })
  }
  if (!apiKey) {
    console.log('No aws apiKey configured')
    return new Response('No aws apiKey configured', { status: 500 })
  }

  try {
    const response = await fetch(stashPdfUrl, {
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
      return new Response(`Error from Stashing PDF: ${error}`, { status: 500 })
    }
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}
