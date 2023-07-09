import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

type VoiceStoreType = Blob | MediaSource
export const voiceStore: Writable<VoiceStoreType> = writable()
