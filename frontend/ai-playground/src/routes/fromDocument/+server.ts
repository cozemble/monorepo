import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { mandatoryOpenAiCreds, OpenAi } from '$lib/generative/GenerativeAiBackend'
import { promptEventSender } from '$lib/analytics/promptEventSender'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }
  if (!data.html) {
    throw error(400, 'No html provided')
  }
  console.log({ data })
  try {
    const openAi = new OpenAi(mandatoryOpenAiCreds(), promptEventSender)
    const result = await openAi.schemaFromDocumentHtml(data.html)
    if (!result) {
      return new Response('No result', { status: 500 })
    }
    return new Response(JSON.stringify({ result }), { status: 200 })
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
