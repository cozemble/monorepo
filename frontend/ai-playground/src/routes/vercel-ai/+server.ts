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

  const openAiPrompt = `Generate a JSON schema for a "${prompt}" object in our extended version of JSON Schema. This object should include the 10 most common properties for a "${prompt}".

Here are some guidelines for the schema:

1. We use an additional keyword 'unique' to ensure that the values of the specified field are unique among all objects in an array or all properties of an object. For example:

{
  'type': 'object',
  'properties': {
    'id': {
      'type': 'string',
      'unique': true
    }
  }
}

2. To express that a property should be an attachment or some kind of binary file, use the 'contentEncoding' and 'contentMediaType' keywords.

3. We do not use the "date-time" format. Instead, we use "date" and "time" formats. This might mean using two properties to represent a date-time value.

4. We make use of all other formats listed in the JSON Schema specification.

5. Use the 'title' keyword to give a name to your schema. We also support a keyword called 'pluralTitle' which represents the name of the schema in plural form.

6. Do not include any "timestamp" style properties associated with creation and modification of the object, as we will add those automatically.

7. Do not explain the code at all, as I want to parse your response and generate documentation from it.
`

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
