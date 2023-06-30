import { writable, type Writable } from 'svelte/store'
import type { JustErrorMessage, Value } from '@cozemble/lang-util'

export interface ChatRequest {
  _type: 'chat.request'
  url: string
  payload: any
  responseValidator: (json: any) => JustErrorMessage | null
  continuation: (response: JustErrorMessage | Value) => void
}

export const currentAiChatRequest: Writable<ChatRequest | null> = writable(null)
export const currentAiChatRequestAttempts: Writable<number> = writable(0)

export function setCurrentAiChatRequest(
  url: string,
  payload: any,
  continuation: (response: JustErrorMessage | Value) => void,
  responseValidator: (json: any) => JustErrorMessage | null = () => null,
) {
  currentAiChatRequest.set({ _type: 'chat.request', url, payload, continuation, responseValidator })
  currentAiChatRequestAttempts.set(1)
}

export function clearCurrentAiChatRequest() {
  currentAiChatRequest.set(null)
  currentAiChatRequestAttempts.set(0)
}
