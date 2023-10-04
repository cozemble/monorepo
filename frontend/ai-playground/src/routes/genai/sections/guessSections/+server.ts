import { callOpenAi } from '../../tables/guessTableType/callOpenAi'

// Set the runtime to edge for best performance
export const config = {
  runtime: 'edge',
}

export async function POST({ request }) {
  const { prompt } = await request.json()
  const { html, stream } = JSON.parse(prompt)

  const openAiPrompt = `This HTML is  from an OCR scan of a document.  
      The document is a "data" document, like an invoice or a receipt or a delivery note, 
      as opposed to a textual document like a letter or a contract.
      I want you to ignore the tables in this HTML, and focus on the lines of text.
      I want you to look at these lines and tell me what logical sections of data you see, along with the lines you think belong in each section.
      Return the response as json, like this:
      
      [
        {"sectionName":<name>, "lines":[<line>, <line>, <line>]},
        {"sectionName":<name>, "lines":[<line>, <line>, <line>]}
      ]
    
    Here is the HTML:
    -------------------------
    ${html}
    -------------------------
    Please only return json.  Do not explain the json.  I want json only.  If you explain the json, I will not be able to parse it.`

  console.log({ openAiPrompt })

  return callOpenAi(openAiPrompt, stream === true)
}
