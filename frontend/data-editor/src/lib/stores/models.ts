import type { Writable } from 'svelte/store'
import type { Schema } from 'jsonschema'

import { writable } from 'svelte/store'

import { invoiceModel } from '$lib/mock/models'

export const selectedModel: Writable<Schema> = writable(invoiceModel)