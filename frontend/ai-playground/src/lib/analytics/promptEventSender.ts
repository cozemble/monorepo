import type { PromptEvent } from '$lib/analytics/types'
import { generationSessionId } from '$lib/generative/stores'
import { get } from 'svelte/store'

const uri =
  'https://backend-tenanted-api-qwquwvrytq-nw.a.run.app/dev/api/v1/ai-playground/prompt-event'

export function promptEventSender(promptEvent: PromptEvent): void {
  console.info('Sending prompt event to backend')
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
