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

2. We do not use the "date-time" format. Instead, we use "date" and "time" formats. This might mean using two properties to represent a date-time value.

3. We make use of all other formats listed in the JSON Schema specification.

4. Use the 'title' keyword to give a name to your schema. We also support a keyword called 'pluralTitle' which represents the name of the schema in plural form.

5. Do not include any "timestamp" style properties associated with creation and modification of the object, as we will add those automatically.

6. Do not explain the code at all, as I want to parse the code and generate documentation from it.
`
    return await this._sendPrompt('first', databaseType, prompt)
  }

  async amendmentPrompt(
    existingSchema: JsonSchema,
    promptText: string,
  ): Promise<string | undefined> {
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
Do not include any "timestamp" style properties associated with creation and modification of the object.  We will add those automatically.
Do not explain the code at all because I want to parse the code and generate documentation from it.

We have this existing schema:

${JSON.stringify(existingSchema, null, 2)}

Please make this amendment to it: ${promptText}.
Do not explain the code at all because I want to parse the code and generate documentation from it.`
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
    promptType: 'first' | 'amendment' | 'generate-data',
    userPrompt: string,
    prompt: string,
  ) {
    const startTimestamp = new Date().getTime()
    const successfulEventConstructor =
      promptType === 'first' ? successfulFirstPromptEvent : successfulAmendmentPromptEvent
    const unsuccessfulEventConstructor =
      promptType === 'first' ? failedFirstPromptEvent : failedAmendmentPromptEvent

    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k-0613',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0,
      })
      const content = response.data.choices[0].message?.content
      if (content) {
        await this.promptEventListener(
          successfulEventConstructor(userPrompt, content, startTimestamp),
        )
      } else {
        await this.promptEventListener(
          unsuccessfulEventConstructor(
            userPrompt,
            'Get undefined back from Open AI',
            startTimestamp,
          ),
        )
      }
      return content
    } catch (e: any) {
      await this.promptEventListener(
        unsuccessfulEventConstructor(userPrompt, e.message, startTimestamp),
      )
      console.error(e)
      throw new Error('Failed to call OpenAI : ' + e.message)
    }
  }
}
