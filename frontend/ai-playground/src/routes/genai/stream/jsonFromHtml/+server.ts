import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { OPENAI_API_KEY } from '$env/static/private'

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

// Set the runtime to edge for best performance
export const config = {
  runtime: 'edge',
}

export async function POST({ request }) {
  const { prompt } = await request.json()
  const { html, schema } = JSON.parse(prompt)

  const openAiPrompt = `I have this json schema:
    
    -------------------------
    ${JSON.stringify(schema, null, 2)}
    -------------------------
    
    This HTML is the result of an OCR process on a document:
    
    -------------------------
    ${html}
    -------------------------
     
    Please return a json object adhering to the schema, using values from the HTML.  
    Please help me by formatting every date value you find as yyyy-MM-dd.
    DO NOT MAKE UP DATA.  If you see values in the HTML, please use them.  But do not attempt to fill any blanks.  
    Do not explain the json.  I want json only.  If you explain the json, I will not be able to parse it.`

  const response = await openai.chat.completions.create({
    stream: true,
    messages: [{ role: 'user', content: openAiPrompt }],
    model: 'gpt-3.5-turbo-16k-0613',
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
