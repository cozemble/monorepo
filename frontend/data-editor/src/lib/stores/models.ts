import type { Writable, Readable } from 'svelte/store'

import { writable, derived } from 'svelte/store'
import _ from 'lodash'

import { invoiceModel } from '$lib/mock/models'

/** To interact with the model */
export const selectedModel: Writable<JSONSchema> = writable(invoiceModel)

/** An adapted version of the selected model to be used by the data editor */
export const model: Readable<CozJSONSchema> = derived(
  selectedModel,
  ($selectedModel): CozJSONSchema => $selectedModel, // no more processing needed for now
)

model.subscribe((value) => console.info('model', value))
