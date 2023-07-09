import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { Configuration, OpenAIApi } from 'openai'

type OpenAiCreds = {
  organization: string
  apiKey: string
}

const getOpenApiCred = (): OpenAiCreds => {
  return {
    apiKey: mandatory(process.env.OPENAI_API_KEY, `No OPENAI_API_KEY provided`),
    organization: mandatory(process.env.OPENAI_ORGANIZATION, `No OPENAI_ORGANIZATION provided`),
  }
}

// Transcribe
export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }

  const fileBuffer = Buffer.from(data, 'base64')

  try {
    const openai = new OpenAIApi(new Configuration(getOpenApiCred()))

    const response = await openai.createTranscription(fileBuffer, 'whisper-1')

    console.log(response)
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
