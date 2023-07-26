import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import { createWorker } from 'tesseract.js'

export const POST: RequestHandler = async (event: RequestEvent) => {
  const formData = await event.request.formData()
  const imageFile: any = formData.get('image')

  console.log({ imageFile, props: Object.getOwnPropertyNames(imageFile) })
  const fileData = await imageFile.arrayBuffer()

  const buffer = Buffer.from(fileData)

  // await worker.load()
  const worker = await createWorker()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')

  const {
    data: { text },
  } = await worker.recognize(buffer)

  await worker.terminate()

  if (text) {
    return new Response(JSON.stringify({ text }), { status: 200 })
  }
  return new Response('No result', { status: 500 })
}
