import {mandatory} from "@cozemble/lang-util";
import {createClient} from '@supabase/supabase-js';
import OpenAI from "openai";
import {ChatCompletionCreateParamsNonStreaming} from 'openai/resources/chat/completions'
import 'dotenv/config';
import {createSlackTimestamp} from "./slack.js";


const slackChannelId = mandatory(process.env.SLACK_CHANNEL_ID, "No SLACK_CHANNEL_ID in env");
const supabaseUrl = mandatory(process.env.SUPABASE_URL, "No SUPABASE_URL in env");
const supabaseAnonKey = mandatory(process.env.SUPABASE_ANON_KEY, "No SUPABASE_ANON_KEY in env");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchLatestSummarisationTimestamp(channelId: string): Promise<string> {
    const {data, error} = await supabase
        .from('channel_summarisation_history')
        .select('summarisation_timestamp')
        .eq('channel_id', channelId)
        .order('summarisation_timestamp', {ascending: false})
        .limit(1);

    if (error || data.length === 0) {
        return createSlackTimestamp(new Date(0).getTime())
    }

    // Assuming summarisation_timestamp is in ISO 8601 format
    return data[0].summarisation_timestamp;
}


async function fetchMessagesSince(timestamp: string, channelId: string): Promise<string[]> {
    const {data, error} = await supabase
        .from('channel_messages')
        .select('text')
        .eq('channel_id', channelId)
        .gte('ts', timestamp)
        .order('ts', {ascending: true});

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return data.map(row => row.text);
}

function concatenateMessages(messages: string[]): string {
    return messages.join(' '); // or any other delimiter as per your need
}


async function callOpenAi(apiParams: ChatCompletionCreateParamsNonStreaming) {
    const OPENAI_API_KEY = mandatory(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY')

    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
    })


    try {
        const response = await openai.chat.completions.create(apiParams)
        const content = response.choices[0].message?.content
        if (!content) {
            throw new Error('No content in response')
        }

        return content;
    } catch (error) {
        console.error('OpenAI API error:', error);
        return "An error occurred during summarization.";
    }
}

async function summarizeText(text: string): Promise<string> {
    return await callOpenAi({
        messages: [{
            role: 'user',
            content: "Summarize the following text.  Return just the summary, with no explanatory text, because your response will be extracted by a computer program:\n" + text
        }],
        model: 'gpt-3.5-turbo-16k-0613',
        temperature: 0.3,
        max_tokens: 10000,
        top_p: 1,
        frequency_penalty: 0,
    });
}

async function outlineBlogPosts(text: string): Promise<string> {
    return await callOpenAi({
        messages: [{
            role: 'user',
            content: "Outline potential blog posts based on the following text.  Give me the blog post title, and a synopsis.  Return just the data I am asking for, with no explanatory text, because your response will be extracted by a computer program:\n" + text
        }],
        model: 'gpt-3.5-turbo-16k-0613',
        temperature: 0.3,
        max_tokens: 10000,
        top_p: 1,
        frequency_penalty: 0,
    });
}


async function summarizeNewMessages(channelId: string): Promise<void> {
    const latestTimestamp = await fetchLatestSummarisationTimestamp(channelId);

    if (!latestTimestamp) {
        console.log('No summarisation timestamp found.');
        return;
    }

    const messages = await fetchMessagesSince(latestTimestamp, channelId);
    if (messages.length === 0) {
        console.log('No new messages to summarize.');
        return;
    }

    const concatenatedMessages = concatenateMessages(messages);
    console.log({concatenatedMessages});
    const [summary, blogs] = await Promise.all([summarizeText(concatenatedMessages), outlineBlogPosts(concatenatedMessages)]);

    console.log('Summary:', summary);
    console.log('blogs:', blogs);
}

// Example usage
await summarizeNewMessages(slackChannelId).catch(console.error);
