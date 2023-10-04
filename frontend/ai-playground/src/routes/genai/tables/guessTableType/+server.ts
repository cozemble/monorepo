import OpenAI from 'openai'
import { mandatory } from '@cozemble/lang-util'
import { extractJSON } from '$lib/generative/extractJson'
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions'
import { OpenAIStream, StreamingTextResponse } from 'ai'

function guessTableTypePrompt(tableCount: number, tablesAsCsv: string): string {
  return `Here are ${tableCount} tables represented as CSV.  They have been scanned by an OCR process.
    For each table, tell me whether you think it is a normal table of rows of data,
    or a "layout" table, containing a mix of different fields.
    Also, take a guess at labelling the table based on its contents.
    Note that it is not uncommon for the same kind of table to appear more than once in a document.
    
    Reply using a json array, like this:
    
    [
      {
        "tableIndex": 1, "type":"layout", "label":"address",
        "tableIndex": 2, "type":"rows", "label":"line items",
        "tableIndex": 3, "type":"rows", "label":"line items",
        "tableIndex": 4, "type":"rows", "label":"transactions",
        "tableIndex": 5, "type":"layout", "label":"terms and conditions"
      }
    ]
    
    Return only the json because I will be parsing your response.
    
    Here is the CSV for each table:
    
    ${tablesAsCsv}`
}

export async function POST({ request }) {
  try {
    const { prompt } = await request.json()
    const { tableCount, tablesAsCsv, stream } = JSON.parse(prompt)

    const openAiPrompt = guessTableTypePrompt(tableCount, tablesAsCsv)

    const OPENAI_API_KEY = mandatory(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY')

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    })

    const apiParams: ChatCompletionCreateParamsNonStreaming = {
      messages: [{ role: 'user', content: openAiPrompt }],
      model: 'gpt-4-0613',
      temperature: 0.3,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0,
    }
    if (stream === true) {
      const response = await openai.chat.completions.create({ ...apiParams, stream: true })
      const stream = OpenAIStream(response)
      return new StreamingTextResponse(stream)
    } else {
      const response = await openai.chat.completions.create(apiParams)
      const content = response.choices[0].message?.content
      if (!content) {
        throw new Error('No content in response')
      }
      const json = extractJSON(content)
      if (!json) {
        throw new Error('No JSON found')
      }
      console.log({ json })
      return new Response(JSON.stringify({ result: json }), { status: 200 })
    }
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }
}
