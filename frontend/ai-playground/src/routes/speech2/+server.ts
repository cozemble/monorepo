import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { mandatory } from '@cozemble/lang-util'
import { OpenAI, toFile } from 'openai'

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
export const POST: RequestHandler = async (event: RequestEvent) => {
  const formData = await event.request.formData()
  const audioFile: any = formData.get('audio')

  const fileData = await audioFile.arrayBuffer()

  const buffer = Buffer.from(fileData)

  const openai = new OpenAI(getOpenApiCred())
  const file = await toFile(buffer, 'audio.webm', { type: 'audio/webm' })
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
  })
  if (response.text) {
    return new Response(JSON.stringify({ text: response.text }), { status: 200 })
  }
  return new Response('No result', { status: 500 })
}
