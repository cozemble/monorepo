import {addBase64Image, callOpenAi} from "../../tables/guessTableType/callOpenAi";

// Set the runtime to edge for best performance
export const config = {
    runtime: 'edge',
}

export async function POST({request}) {
    const formData = await request.formData()
    const imageFile: any = formData.get('image')
    if (!imageFile) {
        return new Response('No image file provided', { status: 400 })
    }

    const openAiPrompt = `This document is a "data document" like an invoice or receipt or docket.
I want to extract the data from this document and store it in a json object.
I want the data grouped into sections to reflect the structure of the document, as you read it from top to bottom and left to right.
Pay particular attention to sections marked with a heading, and sections marked with lines.
Return only the json, no explanations or comments.
The json should be structured like this:

{
  "<sectionName>": {
    "<fieldName>": "<fieldValue>",
    "<fieldName>": "<fieldValue>",
    "<fieldName>": "<fieldValue>",
    "<fieldName>": "<fieldValue>"
  },
    "<sectionName>": {
        "<fieldName>": "<fieldValue>",
        "<fieldName>": "<fieldValue>",
        "<fieldName>": "<fieldValue>",
        "<fieldName>": "<fieldValue>"
    },
}
`
    return callOpenAi(openAiPrompt, true, 'gpt-4-vision-preview', addBase64Image(imageFile))
}
