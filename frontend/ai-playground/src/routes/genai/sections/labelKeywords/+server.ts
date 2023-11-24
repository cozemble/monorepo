import { callOpenAi } from '../../tables/guessTableType/callOpenAi'

// Set the runtime to edge for best performance
export const config = {
    runtime: 'edge',
}

export async function POST({ request }) {
    const { prompt } = await request.json()
    const { html } = JSON.parse(prompt)

    const openAiPrompt = `This HTML is from an OCR scan of a document.  
      The document is a "data" document, like an invoice or a receipt or a delivery note, 
      as opposed to a textual document like a letter or a contract.
      I want you to ignore the tables in this HTML, and focus on the paragraphs.
      The paragraphs are numbered by ID.
      I want you to tell me which part of each paragraph is a "fixed" word or phrase.
      If a paragraph contains no fixed words, just ignore that paragraph
      Return the response as json, like this:
      
      [
        {"paragraphNumber":<PARAGRAPH NUMBER>, "fixedWord":"<FIXED WORD>"},
        {"paragraphNumber":<PARAGRAPH NUMBER>, "fixedWord":"<FIXED WORD>"},
      ]
    
    Here is the HTML:
    -------------------------
    ${html}
    -------------------------
    Please only return json.  Do not explain the json.  I want json only.  If you explain the json, I will not be able to parse it.`

    return callOpenAi(openAiPrompt,  true, 'gpt-4-1106-preview')
}

export type LabelledKeywordResponse = { paragraphNumber: string; fixedWord: string }