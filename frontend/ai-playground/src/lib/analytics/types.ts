export interface PromptEvent {
  _type: 'prompt.event'
  promptType: 'first' | 'amendment'
  userPromptText: string
  issuedPrompt: string
  responseText: string | null
  promptTemplateId: string
  error: string | null
  submitTimestamp: number
  responseTimestamp: number
}

function firstPromptEvent(
  promptTemplateId: string,
  userPromptText: string,
  issuedPrompt: string,
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
    issuedPrompt,
    responseText,
    error,
    submitTimestamp,
    responseTimestamp,
  }
}

export function amendmentPromptEvent(
  promptTemplateId: string,
  userPromptText: string,
  issuedPrompt: string,
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
    issuedPrompt,
    responseText,
    error,
    submitTimestamp,
    responseTimestamp,
  }
}

export function successfulFirstPromptEvent(
  userPromptText: string,
  issuedPrompt: string,
  responseText: string,
  submitTimestamp: number,
): PromptEvent {
  return firstPromptEvent(
    '22-06-2023',
    userPromptText,
    issuedPrompt,
    responseText,
    null,
    submitTimestamp,
  )
}

export function failedFirstPromptEvent(
  userPromptText: string,
  issuedPrompt: string,
  error: string,
  submitTimestamp: number,
): PromptEvent {
  return firstPromptEvent('22-06-2023', userPromptText, issuedPrompt, null, error, submitTimestamp)
}

export function successfulAmendmentPromptEvent(
  userPromptText: string,
  issuedPrompt: string,
  responseText: string,
  submitTimestamp: number,
): PromptEvent {
  return amendmentPromptEvent(
    '22-06-2023',
    userPromptText,
    issuedPrompt,
    responseText,
    null,
    submitTimestamp,
  )
}

export function failedAmendmentPromptEvent(
  userPromptText: string,
  issuedPrompt: string,
  error: string,
  submitTimestamp: number,
): PromptEvent {
  return amendmentPromptEvent(
    '22-06-2023',
    userPromptText,
    issuedPrompt,
    null,
    error,
    submitTimestamp,
  )
}
