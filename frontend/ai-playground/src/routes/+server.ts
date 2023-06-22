import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { mandatoryOpenAiCreds, OpenAi } from '$lib/generative/GenerativeAiBackend'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }
  if (!data.databaseType) {
    throw error(400, 'No databaseType provided')
  }
  try {
    const openAi = new OpenAi(mandatoryOpenAiCreds())
    const result = await openAi.firstPrompt(data.databaseType)
    if (!result) {
      return new Response('No result', { status: 500 })
    }
    return new Response(JSON.stringify({ result }), { status: 200 })
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
