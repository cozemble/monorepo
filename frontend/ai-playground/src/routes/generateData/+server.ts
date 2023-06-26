import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { mandatoryOpenAiCreds, OpenAi } from '$lib/generative/GenerativeAiBackend'
import { promptEventSender } from '$lib/analytics/promptEventSender'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }
  if (!data.existingSchema) {
    throw error(400, 'No existingSchema provided')
  }
  if (!data.pluralTitle) {
    throw error(400, 'No pluralTitle provided')
  }
  if (!data.existingRecordsSummary) {
    throw error(400, 'No existingRecordsSummary provided')
  }
  try {
    const openAi = new OpenAi(mandatoryOpenAiCreds(), promptEventSender)
    const result = await openAi.generateData(
      data.existingSchema,
      data.pluralTitle,
      data.existingRecordsSummary,
    )
    if (!result) {
      return new Response('No result', { status: 500 })
    }
    return new Response(JSON.stringify({ result }), { status: 200 })
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
