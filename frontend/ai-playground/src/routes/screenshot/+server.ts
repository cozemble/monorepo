import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data || !data.url) {
    throw new Error('No URL provided')
  }

  const selectors = (data.selectors || []).filter((s) => s.trim().length > 0)
  const apiKey = process.env.SCREENSHOT_API_KEY
  const screenshotUrl = process.env.SCREENSHOT_URL
  if (!screenshotUrl) {
    console.log('No screenshotUrl configured')
    return new Response('No screenshotUrl configured', { status: 500 })
  }
  if (!apiKey) {
    console.log('No apiKey configured')
    return new Response('No apiKey configured', { status: 500 })
  }

  const fetch = event.fetch
  try {
    // Proxy the request to Express endpoint
    const response = await fetch(screenshotUrl, {
      method: 'POST',
      body: JSON.stringify({ ...data, selectors }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
    })

    if (!response.ok) {
      return new Response(`Error from Express server: ${response.statusText}`, { status: 500 })
    }

    const screenshot = await response.arrayBuffer()

    return new Response(screenshot, { headers: { 'Content-Type': 'image/png' } })
  } catch (error: any) {
    console.error(error)
    throw new Error('An error occurred while processing the request')
  }
}
