import type { PromptEvent } from '$lib/analytics/types'
import { generationSessionId } from '$lib/generative/stores'
import { get } from 'svelte/store'

const uri =
  'https://backend-tenanted-api-qwquwvrytq-nw.a.run.app/dev/api/v1/ai-playground/prompt-event'
// const uri = 'http://localhost:3000/dev/api/v1/ai-playground/prompt-event'

export async function promptEventSender(promptEvent: PromptEvent): Promise<void> {
  try {
    const sessionId = get(generationSessionId)
    await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, promptEvent }),
    }).catch((e) => console.error(e))
  } catch (e) {
    console.error('Failed to send prompt event', e)
  }
}
