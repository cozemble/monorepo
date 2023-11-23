import {mandatory} from "@cozemble/lang-util";
import {ConversationsHistoryArguments, WebClient} from "@slack/web-api";
import 'dotenv/config';
import {createClient} from '@supabase/supabase-js';
import {createSlackTimestamp} from "./slack.js";

const slackChannelId = mandatory(process.env.SLACK_CHANNEL_ID, "No SLACK_CHANNEL_ID in env");
const botUserOAuthToken = mandatory(process.env.SLACK_BOT_USER_OAUTH_TOKEN, "No SLACK_BOT_USER_OAUTH_TOKEN in env");
const supabaseUrl = mandatory(process.env.SUPABASE_URL, "No SUPABASE_URL in env");
const supabaseAnonKey = mandatory(process.env.SUPABASE_ANON_KEY, "No SUPABASE_ANON_KEY in env");

const slack = new WebClient(botUserOAuthToken);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertMessagesToSupabase(messages: any[]) {
    // Map all messages to the structure expected by your Supabase table
    const messageData = messages.map(message => ({
        text: message.text,
        type: message.type,
        subtype: message.subtype ?? null,
        user: message.user,
        ts: message.ts,
        client_msg_id: message.client_msg_id ?? null,
        channel_id: slackChannelId
    }));

    const {data, error} = await supabase
        .from('channel_messages')
        .insert(messageData);

    if (error) {
        console.error('Error inserting messages:', error);
        return;
    }

    console.log('Messages inserted:', data);
}

async function getMaxFetchTimestamp(channelId: string): Promise<string | null> {
    const {data, error} = await supabase.rpc('get_latest_fetch_timestamp', {channel_id_input: channelId});


    if (error || !data) {
        console.error(error || 'No fetch timestamp found');
        return null;
    }
    return data
}


// Fetching channel history
async function fetchChannelHistory(channelId: string) {
    let fetchParams: ConversationsHistoryArguments = {
        channel: channelId
    }
    const lastFetchTimestamp = await getMaxFetchTimestamp(channelId);
    if (lastFetchTimestamp) {
        fetchParams = {
            ...fetchParams,
            oldest: lastFetchTimestamp
        };
    }
    try {
        const now = createSlackTimestamp();
        const response = await slack.conversations.history(fetchParams);

        // upsert fetch history
        const {error} = await supabase
            .from('channel_fetch_history')
            .upsert([
                {
                    channel_id: channelId,
                    fetch_timestamp: now
                }
            ]);
        if (error) {
            console.error('Error upserting fetch history:', error);
            return;
        }
        return response.messages;
    } catch (error) {
        console.error(error);
    }
}

// Use the function with your channel ID
await fetchChannelHistory(slackChannelId)
    .then(messages => {
        console.log(messages);
        if (!messages) return;
        return insertMessagesToSupabase(messages)
    });

