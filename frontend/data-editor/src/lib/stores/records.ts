import type { Writable } from 'svelte/store'

import { writable, get } from 'svelte/store'
import Ajv from 'ajv'

import { removeEmptyValues, initValues } from '$lib/utils'
import { selectedModel } from './models'
import { addErrors } from '$lib/stores/errors'

export const records: Writable<Record<string, any>[]> = writable([])
export const currentRecord: Writable<Record<string, any>> = writable({})

selectedModel.subscribe((model) => {
  currentRecord.set(initValues(model?.properties || {}))
})

export async function validateRecord(record: Record<string, any>) {
  // create ajv instance
  const ajv = new Ajv({
    allErrors: true,
  })

  ajv.addVocabulary(['coz', 'formula', 'customComponent']) // cozemble specific keywords

  const validate = ajv.compile(get(selectedModel))
  const valid = validate(removeEmptyValues(record))

  console.log('valid: ', valid)

  addErrors(validate.errors)

  return valid
}
