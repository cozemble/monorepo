import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'

const ORGANIZATION_ID = 'org-'
const API_KEY = 'sk-'

const configuration = new Configuration({
  apiKey: API_KEY,
  organization: ORGANIZATION_ID,
})

const openai = new OpenAIApi(configuration)

export async function promptManager(value: string): Promise<string | undefined> {
  // RE-WORK CHATGPT PROMPT
  // const prompt = `Generate json schema \n Use json schema "ref" to express relationships: \n ${value} \n I need the only the code, I don't need any explanations`
  const prompt = `In our extended version of JSON Schema, we have an additional keyword 'unique'.
This keyword is used to ensure that the values of the specified field are unique among all objects in an array or all properties of an object.
It's used in the same place where you'd use 'type', 'format', or similar keywords. For instance:

{
  'type': 'object',
  'properties': {
    'id': {
      'type': 'string',
      'unique': true
    },
    ...
  }
  ...
}

In addition, we do not use the "date-time" format.  Instead we use "date" and "time" formats.  This might mean you will have to use two properties to represent a date-time value.
We do make use of all the other formats listed in the JSON Schema specification.
Use the 'title' keyword to give a name to your schema.  We also support a keyword called 'pluralTitle' which represents the name of the schema in plural form.  It goes beside 'title' in the schema.
Do not include "timestamp" properties associated with creation and modification of the object.  We will add those automatically.
Do not explain the code at all because I want to parse the code and generate documentation from it.

Given this, generate a schema for a ${value} object.`

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    // prompt: prompt,
    messages: [{ role: 'user', content: prompt }],
    temperature: 1,
    max_tokens: 3000,
    top_p: 1,
    // best_of: 1,
    frequency_penalty: 0,
  })

  return response.data.choices[0].message?.content
}
