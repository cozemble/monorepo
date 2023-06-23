import type { PromptEvent } from '$lib/analytics/types'
import { generationSessionId } from '$lib/generative/stores'
import { get } from 'svelte/store'

const uri = 'http://localhost:3000/dev/api/v1/ai-playground/prompt-event'

export function promptEventSender(promptEvent: PromptEvent): void {
  const sessionId = get(generationSessionId)
  console.log({ sessionId, promptEvent })
  fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, promptEvent }),
  })
    .then((response) => {
      console.log('prompt event sent', { status: response.status })
    })
    .catch((e) => console.error(e))
}
