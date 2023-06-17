import { Configuration, OpenAIApi } from 'openai'
// import { ChatGPTAPI } from 'chatgpt'

const ORGANIZATION_ID = 'org-XXXXX'
const API_KEY = 'sk-XXXXX'

const configuration = new Configuration({
  apiKey: API_KEY,
  organization: ORGANIZATION_ID,
})

const openai = new OpenAIApi(configuration)

export async function promptManager(value: string): Promise<string | undefined> {
  // RE-WORK CHATGPT PROMPT
  const prompt = `Generate json schema \n Use json schema "ref" to express relationships: \n ${value} \n I need the only the code, I don't need any explanations`

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
