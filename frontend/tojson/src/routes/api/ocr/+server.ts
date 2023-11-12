export async function POST({ fetch, request }) {
  // TODO authorization

  // TODO organize request validation with middleware (zod?)

  const formData = await (async () => {
    try {
      const form = await request.formData()
      return form
    } catch (error) {
      console.log('Error parsing form data:', error)
      return null
    }
  })()

  if (!formData) return new Response('Could not parse form data', { status: 400 })

  const imageFile = formData.get('image')

  if (!imageFile) return new Response('No image file provided', { status: 400 })

  // TODO check for env vars on startup instead of runtime
  const apiKey = process.env.OCR_API_KEY
  const ocrUrl = process.env.OCR_URL

  if (!apiKey) {
    console.log('No apiKey configured')
    return new Response('No apiKey configured', { status: 500 })
  }
  if (!ocrUrl) {
    console.log('No ocr url configured')
    return new Response('No ocr url configured', { status: 500 })
  }
  console.log('OCR URL:', ocrUrl)

  // TODO move to separate function
  try {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(ocrUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: apiKey,
      },
    })

    console.log('OCR response:', response)
    if (response.ok) {
      const result = await response.json()
      return new Response(JSON.stringify(result), { status: 200 })
    } else {
      const error = await response.text()
      return new Response(JSON.stringify(`Error from Google Cloud: ${error}`), {
        status: 500,
      })
    }
  } catch (error: any) {
    console.log('Error doing OCR:', error)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}
