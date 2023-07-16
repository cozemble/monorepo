import { Configuration, OpenAIApi } from 'openai'
import type { JsonSchema } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'
import type { PromptEvent } from '$lib/analytics/types'
import {
  failedAmendmentPromptEvent,
  failedFirstPromptEvent,
  successfulAmendmentPromptEvent,
  successfulFirstPromptEvent,
} from '$lib/analytics/types'
import { extractJSON } from '$lib/generative/extractJson'

export function mandatoryOpenAiCreds(): OpenAiCreds {
  return {
    apiKey: mandatory(process.env.OPENAI_API_KEY, `No OPENAI_API_KEY provided`),
    organization: mandatory(process.env.OPENAI_ORGANIZATION, `No OPENAI_ORGANIZATION provided`),
  }
}

export type OpenAiCreds = {
  organization: string
  apiKey: string
}

export type PromptEventListener = (event: PromptEvent) => Promise<void>
export const nullPromptEventListener: PromptEventListener = async () => {}

export type OpenAiMessage = { role: 'user' | 'assistant'; content: string }

export class OpenAi {
  constructor(
    private creds: OpenAiCreds,
    private promptEventListener: PromptEventListener = nullPromptEventListener,
    private readonly openai = new OpenAIApi(new Configuration(creds)),
  ) {}

  async firstPrompt(databaseType: string): Promise<string | undefined> {
    const prompt = `Generate a JSON schema for a "${databaseType}" object in our extended version of JSON Schema. This object should include the 10 most common properties for a "${databaseType}".

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
    return await this._sendPrompt('first', databaseType, prompt)
  }

  async amendmentPrompt(
    existingSchema: JsonSchema,
    promptText: string,
  ): Promise<string | undefined> {
    const prompt = `In our extended version of JSON Schema, we use an additional keyword 'unique'.
This keyword ensures that a specific property value remains unique across all JSON documents in our database.

Here is an example:

{
  'type': 'object',
  'properties': {
    'id': {
      'type': 'string',
      'unique': true
    }
  }
}

In this case, the 'unique' keyword guarantees that no two documents in the database have the same 'id' value.

We also follow other specific rules:
1. We do not use the "date-time" format. Instead, we use "date" and "time" formats, implying you might need to use two properties to represent a date-time value.
2. We utilize all other formats listed in the JSON Schema specification.
3. Use the 'title' keyword to name your schema. We also support a keyword called 'pluralTitle' for the plural form of the schema's name.
4. Avoid including any "timestamp" style properties related to the creation or modification of the object as we will add these automatically.
5. To express that a property should be an attachment or some kind of binary file, use the 'contentEncoding' and 'contentMediaType' keywords.

Now, consider this existing schema:

${JSON.stringify(existingSchema, null, 2)}

We need the following amendment: "${promptText}". 
Remember, there's no need to explain the code, as it will be parsed to generate documentation.`
    return await this._sendPrompt('amendment', promptText, prompt)
  }

  async generateData(
    existingSchema: JsonSchema,
    pluralTitle: string,
    existingRecordsSummary: any[],
  ): Promise<string | undefined> {
    const prompt = `I have this json schema with represents ${pluralTitle}.  Generate 3 examples of ${pluralTitle} that would be valid according to this schema.\n  
    Return the results as a json array ready for me to parse. Do not explain the code.  I want code only.  If you explain the code, I will not be able to parse it.\n 
    To help you avoid duplicates, here are some existing records: ${JSON.stringify(
      existingRecordsSummary,
      null,
      2,
    )}\n
    Here is the schema:\n ${JSON.stringify(existingSchema, null, 2)}`
    return await this._sendPrompt('generate-data', 'generate data', prompt)
  }

  private async _sendPrompt(
    promptType: 'first' | 'amendment' | 'generate-data' | 'text-to-data',
    userPrompt: string,
    prompt: string,
    previousChat: OpenAiMessage[] = [],
  ): Promise<string | undefined> {
    const startTimestamp = new Date().getTime()
    const successfulEventConstructor =
      promptType === 'first' ? successfulFirstPromptEvent : successfulAmendmentPromptEvent
    const unsuccessfulEventConstructor =
      promptType === 'first' ? failedFirstPromptEvent : failedAmendmentPromptEvent

    const message: OpenAiMessage = { role: 'user', content: prompt }
    const messages: OpenAiMessage[] = [...previousChat, message]
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k-0613',
        messages,
        temperature: 0.3,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
      })
      const content = response.data.choices[0].message?.content
      console.log({ content, prompt })
      if (!content) {
        await this.promptEventListener(
          unsuccessfulEventConstructor(
            userPrompt,
            'Get undefined back from Open AI',
            startTimestamp,
          ),
        )
        return undefined
      }
      const json = extractJSON(content)
      if (!json) {
        throw new Error('No JSON found')
      }
      await this.promptEventListener(
        successfulEventConstructor(userPrompt, JSON.stringify(json, null, 2), startTimestamp),
      )
      return JSON.stringify(json, null, 2)
    } catch (e: any) {
      await this.promptEventListener(
        unsuccessfulEventConstructor(userPrompt, e.message, startTimestamp),
      )
      console.error(e)
      throw new Error('Failed to call OpenAI : ' + e.message)
    }
  }

  async textToDataPrompt(
    schema: JsonSchema,
    text: string,
    existingObject: any | null,
  ): Promise<string | undefined> {
    const prompt = existingObject
      ? this.existingObjectPrompt(schema, text, existingObject)
      : this.newObjectPrompt(schema, text)

    return await this._sendPrompt('text-to-data', text, prompt)
  }

  private existingObjectPrompt(schema: JsonSchema, text: string, existingObject: any) {
    return `I have this json schema:
    
    ----------BEGIN SCHEMA---------------
    ${JSON.stringify(schema, null, 2)}
    ----------END SCHEMA---------------
    
    A user spoke this block of text, to amend this json object, which should already be valid according to this schema:
    
    ----------BEGIN EXISTING JSON OBJECT---------------
    ${JSON.stringify(existingObject, null, 2)}
    ----------END EXISTING JSON OBJECT---------------
    
    ----------BEGIN WHAT THE USER SPOKE---------------
    ${text}
    ----------END WHAT THE USER SPOKE---------------
    
    Please return an amended json object adhering to the schema, using values from the text.  Do not explain the json.  I want json only.  If you explain the json, I will not be able to parse it.`
  }

  private newObjectPrompt(schema: JsonSchema, text: string) {
    return `I have this json schema:
    
    -------------------------
    ${JSON.stringify(schema, null, 2)}
    -------------------------
    
    A user spoke this block of text, to create a json object that would be valid according to this schema
    
    -------------------------
    ${text}
    -------------------------
    
    Please return a json object adhering to the schema, using values from the text.  Do not explain the json.  I want json only.  If you explain the json, I will not be able to parse it.`
  }
}
