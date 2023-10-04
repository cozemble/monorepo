import { callOpenAi } from './callOpenAi'

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
    return await callOpenAi(openAiPrompt, stream === true)
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }
}
