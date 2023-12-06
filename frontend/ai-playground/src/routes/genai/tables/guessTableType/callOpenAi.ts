import OpenAI from 'openai'
import {mandatory, type Option} from '@cozemble/lang-util'
import {extractJSON} from '$lib/generative/extractJson'
import type {ChatCompletionCreateParamsNonStreaming, CompletionCreateParamsStreaming} from 'openai/resources/chat/completions'
import {OpenAIStream, StreamingTextResponse} from 'ai'


export async function callOpenAi(openAiPrompt: string, stream: boolean, model = 'gpt-4-0613', ...options: Option<ChatCompletionCreateParamsNonStreaming>[]): Promise<Response> {
    const OPENAI_API_KEY = mandatory(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY')

    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
    })

    const apiParams = options.reduce((acc, option) => option(acc), {
        messages: [{role: 'user', content: openAiPrompt}],
        model,
        temperature: 0.3,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
    } as ChatCompletionCreateParamsNonStreaming)
    if (stream) {
        const streamingParams = {...apiParams, stream: true} as CompletionCreateParamsStreaming
        console.log({streamingParams: JSON.stringify(streamingParams, null,2)})
        const response = await openai.chat.completions.create(streamingParams)
        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    } else {
        console.log({apiParams})
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

export function addBase64Image(base64Image: string): Option<ChatCompletionCreateParamsNonStreaming> {
    return (params) => {
        const lastMessage = params.messages[params.messages.length - 1]
        if(!lastMessage) {
            throw new Error('No last message')
        }
        if (lastMessage.role !== 'user') {
            throw new Error('Last message is not a user message')
        }
        const newMessageContent = {"type": "image_url", "image_url": {"url": base64Image}}
        const existingContent = lastMessage.content
        if (typeof existingContent === 'string') {
            lastMessage.content = [{type:"text",text:existingContent}, newMessageContent] as any
        } else {
            lastMessage.content = [...existingContent as any, newMessageContent] as any
        }
        return params
}}