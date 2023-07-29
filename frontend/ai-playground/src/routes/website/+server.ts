import { JSDOM } from 'jsdom'
import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }
  if (!data.url) {
    throw error(400, 'No url provided')
  }
  const fetch = event.fetch
  const response = await fetch(data.url)
  if (!response.ok) {
    throw error(500, 'Failed to fetch')
  }
  const html = await response.text()
  if (!html) {
    return new Response('No result', { status: 500 })
  }

  // Use JSDOM to create a DOM from the HTML
  const dom = new JSDOM(html)

  // Remove all <style>, <script>, and <link rel="stylesheet"> elements
  const elementsToRemove = dom.window.document.querySelectorAll('style, script, link, svg, a, img')
  elementsToRemove.forEach((el) => el.parentNode?.removeChild(el))

  // Try to select the <main> element
  const mainElement = dom.window.document.querySelector('main')
  // const mainElement = null

  // Get the text content. If <main> element exists, use its textContent. Otherwise, use the full document's textContent.
  const textContent = mainElement
    ? mainElement.textContent
    : dom.window.document.documentElement.textContent

  return new Response(JSON.stringify({ text: textContent }), { status: 200 })
}
