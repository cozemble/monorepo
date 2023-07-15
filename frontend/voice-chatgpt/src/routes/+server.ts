import { error, type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import OpenAI, { toFile } from 'openai' // Configuration, OpenAIApi, type CreateTranscriptionResponse
import { mandatory } from '@cozemble/lang-util'

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

// Using JSON & Readble
export const POST: RequestHandler = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }

  try {
    const file = await toFile(Buffer.from(data, 'base64'), 'audio.mp3', { type: 'audio/mp3' })

    const openai = new OpenAI(getOpenApiCred()) // new Configuration(getOpenApiCred())

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
      // temperature: 8.0,
      // response_format: 'json',
    })

    console.log(response.text)
    return new Response(JSON.stringify({ response }), { status: 200 })
  } catch (err: any) {
    if (err instanceof OpenAI.APIError) {
      console.log(err.message)
      return new Response(err.message, { status: err.status })
    }

    throw error(500, err.message)
  }
}

// const fileStream = Readable.from(audioBuffer)
//// @ts-expect-error Workaround till OpenAI fixed the sdk
// fileStream.path = 'audio.mp3'

// Use ffmpeg to convert base64decode to mpga/m4a/wav/webm
// const stream = fs.createReadStream(audioBuffer)

// ;(function () {
//   new Promise((resolve, reject) => {
//     ffmpeg(stream)
//       .toFormat('mp3')
//       .saveToFile('audio.mp3')
//       .on('error', () => reject)
//       .on('end', () => resolve)
//   })
// })()

// fs.writeFileSync(fileStream)
// fs.createWriteStream(audioBuffer).pipe()
