import type { Writable } from 'svelte/store'
import type { JSONSchema } from '$lib/types'

import { writable } from 'svelte/store'

import { invoiceModel } from '$lib/mock/models'

export const selectedModel: Writable<JSONSchema> = writable(invoiceModel)
