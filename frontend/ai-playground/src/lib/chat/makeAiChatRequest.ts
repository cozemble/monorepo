import type { ChatRequest } from '$lib/chat/ChatTypes'
import { currentAiChatRequestAttempts } from '$lib/chat/ChatTypes'
import type { JustErrorMessage, Value } from '@cozemble/lang-util'
import { justErrorMessage, value } from '@cozemble/lang-util'

export async function makeAiChatRequest(
  request: ChatRequest,
  attemptNumber: number,
  errorMessage: JustErrorMessage | null = null,
): Promise<JustErrorMessage | Value> {
  if (attemptNumber > 3) {
    if (errorMessage) {
      return errorMessage
    }
    return justErrorMessage('Failed to call OpenAI: too many attempts')
  }
  currentAiChatRequestAttempts.set(attemptNumber)

  const fetched = await fetch(request.url, {
    method: 'POST',
    body: JSON.stringify(request.payload),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
  if (!fetched.ok) {
    return makeAiChatRequest(
      request,
      attemptNumber + 1,
      justErrorMessage(`Failed to call OpenAI: ${fetched.status} ${fetched.statusText}`),
    )
  }
  const fetchedResponse = await fetched.json()
  const result = fetchedResponse.result
  if (!result) {
    return makeAiChatRequest(
      request,
      attemptNumber + 1,
      justErrorMessage(`Failed to call OpenAI: no 'result' returned`),
    )
  }
  try {
    const parsed = JSON.parse(result)
    const validationError = request.responseValidator(parsed)
    if (validationError === null) {
      return value(parsed)
    }
    return makeAiChatRequest(request, attemptNumber + 1, request.responseValidator(parsed))
  } catch (error: any) {
    return makeAiChatRequest(
      request,
      attemptNumber + 1,
      justErrorMessage(`OpenAI returned an unusable response: ${error.message}`),
    )
  }
}
