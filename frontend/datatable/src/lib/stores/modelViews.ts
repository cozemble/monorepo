import type { ModelView } from '@cozemble/model-core'
import { writable } from 'svelte/store'

export const modelViews = writable([] as ModelView[])
