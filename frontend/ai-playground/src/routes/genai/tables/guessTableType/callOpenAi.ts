import OpenAI from 'openai'
import {mandatory} from '@cozemble/lang-util'
import {extractJSON} from '$lib/generative/extractJson'
import type {ChatCompletionCreateParamsNonStreaming} from 'openai/resources/chat/completions'
import {OpenAIStream, StreamingTextResponse} from 'ai'

export async function callOpenAi(openAiPrompt: string, stream: boolean, model = 'gpt-4-0613'): Promise<Response> {
    const OPENAI_API_KEY = mandatory(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY')

    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
    })

    const apiParams: ChatCompletionCreateParamsNonStreaming = {
        messages: [{role: 'user', content: openAiPrompt}],
        model,
        temperature: 0.3,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
    }
    if (stream) {
        const response = await openai.chat.completions.create({...apiParams, stream: true})
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
        return new Response(JSON.stringify({result: json}), {status: 200})
    }
}
