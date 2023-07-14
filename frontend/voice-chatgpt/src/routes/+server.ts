import { error, type RequestEvent } from '@sveltejs/kit'
import { Configuration, OpenAIApi } from 'openai'
import { Readable } from 'stream'
import { mandatory } from '@cozemble/lang-util'
import fs from 'node:fs'
import ffmpeg from 'fluent-ffmpeg'

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
export const POST = async (event: RequestEvent) => {
  const data = await event.request.json()
  if (!data) {
    throw error(400, 'No data provided')
  }

  const audioBuffer = Buffer.from(data, 'base64')

  const fileStream = Readable.from(audioBuffer)
  // @ts-expect-error Workaround till OpenAI fixed the sdk
  fileStream.path = 'audio.mp3'

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

  try {
    const openai = new OpenAIApi(new Configuration(getOpenApiCred()))

    const response = await openai.createTranscription(fileStream as unknown as File, 'whisper-1')

    console.log(response.data)
    return response.data
  } catch (e: any) {
    console.error(e)
    throw error(500, e.message)
  }
}
