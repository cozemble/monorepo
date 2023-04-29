import { writable } from 'svelte/store'

export type IntroductionState = 'seen' | 'dismissed' | null

export interface IntroductionsState {
  subItemsIntroduction: IntroductionState
}

function emptyIntroductionsState(): IntroductionsState {
  return {
    subItemsIntroduction: null,
  }
}

export const introductionsState = writable<IntroductionsState>(emptyIntroductionsState())
