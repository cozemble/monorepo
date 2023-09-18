import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from '@cozemble/vercel-ai'
import { mandatory } from '@cozemble/lang-util'

// Set the runtime to edge for best performance
export const config = {
  runtime: 'edge',
}

export async function POST({ request }) {
  const { prompt } = await request.json()

  const openAiPrompt = `Below you will find a HTML that is the result of performing OCR on a document.  
    Please return a json schema to capture the data represented by this OCR text.  
    Make sure to include a "title" field to represent the kind of data you think this is.  Please also add a "pluralTitle" field to represent the plural form of the title.
    Please try to help me by adding your best guess of date formats for each date field. 
    Do not explain the json.  I want json only.  If you explain the json, I will not be able to parse it.  The OCR text is below:
    -------------------------
    ${prompt}
    -------------------------`
  const OPENAI_API_KEY = mandatory(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY')

  // Create an OpenAI API client (that's edge friendly!)
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  })

  const response = await openai.chat.completions.create({
    stream: true,
    messages: [{ role: 'user', content: openAiPrompt }],
    model: 'gpt-4-0613',
    temperature: 0.3,
    max_tokens: 3000,
    top_p: 1,
    frequency_penalty: 0,
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
