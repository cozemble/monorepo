import OpenAI from 'openai'
import { mandatory } from '@cozemble/lang-util'
import { extractJSON } from '$lib/generative/extractJson'

export async function POST({ request }) {
  try {
    const { prompt } = await request.json()
    const { tableHtml } = JSON.parse(prompt)

    const openAiPrompt = `This HTML contains a table that has been scanned by an OCR process.
    It contains rows of data.  Sometimes all the rows in a table are of the same type, sometimes not.
    To help me understand what this table contains, please categorize each row for me, based on its contents.
    If you think the first row is a header row, return "header" for that row.
    
    Reply using a json array, like this:
    
    [
      {
        "rowIndex": 1, "category":"header",
        "rowIndex": 2, "category":"line item",
        "rowIndex": 3, "category":"commentary",
        "rowIndex": 4, "category":"line item",
        "rowIndex": 5, "category":"line item",
        "rowIndex": 6, "category":"line item"
      }
    ]
    
    Return only the json because I will be parsing your response.
    
    Here is the HTML for the table:
    
    ${tableHtml}`

    console.log({ openAiPrompt })

    const OPENAI_API_KEY = mandatory(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY')

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    })

    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: openAiPrompt }],
      model: 'gpt-4-0613',
      temperature: 0.3,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0,
    })
    const content = response.choices[0].message?.content
    if (!content) {
      throw new Error('No content in response')
    }
    const json = extractJSON(content)
    if (!json) {
      throw new Error('No JSON found')
    }
    return new Response(JSON.stringify({ result: json }), { status: 200 })
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }
}
