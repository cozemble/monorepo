const PROMPT_TEMPLATE_ID = '22-06-2023'

export interface PromptEvent {
  _type: 'prompt.event'
  promptType: 'first' | 'amendment'
  userPromptText: string
  responseText: string | null
  promptTemplateId: string
  error: string | null
  submitTimestamp: number
  responseTimestamp: number
}

function firstPromptEvent(
  promptTemplateId: string,
  userPromptText: string,
  responseText: string | null,
  error: string | null,
  submitTimestamp: number,
  responseTimestamp = new Date().getTime(),
): PromptEvent {
  return {
    _type: 'prompt.event',
    promptType: 'first',
    promptTemplateId,
    userPromptText,
    responseText,
    error,
    submitTimestamp,
    responseTimestamp,
  }
}

export function amendmentPromptEvent(
  promptTemplateId: string,
  userPromptText: string,
  responseText: string | null,
  error: string | null,
  submitTimestamp: number,
  responseTimestamp = new Date().getTime(),
): PromptEvent {
  return {
    _type: 'prompt.event',
    promptType: 'amendment',
    promptTemplateId,
    userPromptText,
    responseText,
    error,
    submitTimestamp,
    responseTimestamp,
  }
}

export function successfulFirstPromptEvent(
  userPromptText: string,
  responseText: string,
  submitTimestamp: number,
): PromptEvent {
  return firstPromptEvent(PROMPT_TEMPLATE_ID, userPromptText, responseText, null, submitTimestamp)
}

export function failedFirstPromptEvent(
  userPromptText: string,
  error: string,
  submitTimestamp: number,
): PromptEvent {
  return firstPromptEvent(PROMPT_TEMPLATE_ID, userPromptText, null, error, submitTimestamp)
}

export function successfulAmendmentPromptEvent(
  userPromptText: string,
  responseText: string,
  submitTimestamp: number,
): PromptEvent {
  return amendmentPromptEvent(
    PROMPT_TEMPLATE_ID,
    userPromptText,
    responseText,
    null,
    submitTimestamp,
  )
}

export function failedAmendmentPromptEvent(
  userPromptText: string,
  error: string,
  submitTimestamp: number,
): PromptEvent {
  return amendmentPromptEvent(PROMPT_TEMPLATE_ID, userPromptText, null, error, submitTimestamp)
}

export async function submitPromptEvent(sessionId: string, event: PromptEvent) {
  console.log('submitPromptEvent', { sessionId, event })
}
