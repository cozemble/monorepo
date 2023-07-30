import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import puppeteer from 'puppeteer'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data || !data.url) {
    throw error(400, 'No URL provided')
  }

  const selectors = (data.selectors || []).filter((s) => s.trim().length > 0)

  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 4000 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537',
    )

    await page.goto(data.url)

    // Remove elements from the DOM
    for (const selector of selectors) {
      await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel)
        for (const element of elements) {
          element.parentNode.removeChild(element)
        }
      }, selector)
    }

    const screenshot = await page.screenshot({ encoding: 'binary', fullPage: true })
    await browser.close()

    return new Response(screenshot, { headers: { 'Content-Type': 'image/png' } })
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
