import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { mandatoryOpenAiCreds, OpenAi } from '$lib/generative/GenerativeAiBackend'
import { promptEventSender } from '$lib/analytics/promptEventSender'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }
  if (!data.schema) {
    throw error(400, 'No schema provided')
  }
  if (!data.text) {
    throw error(400, 'No text provided')
  }
  try {
    const openAi = new OpenAi(mandatoryOpenAiCreds(), promptEventSender)
    const result = await openAi.textToDataPrompt(data.schema, data.text, data.existingObject)
    if (!result) {
      return new Response('No result', { status: 500 })
    }
    return new Response(JSON.stringify({ result }), { status: 200 })
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
