import type { DataRecord } from '@cozemble/model-core'
import { writable } from 'svelte/store'

export const records = writable([] as DataRecord[])
