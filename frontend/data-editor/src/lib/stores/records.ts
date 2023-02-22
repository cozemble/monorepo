import type { Writable } from 'svelte/store'

import { writable, get } from 'svelte/store'
import Ajv from 'ajv'

import { removeEmptyValues, initValues } from '$lib/utils'
import { selectedModel } from './models'
import { addErrors, errors } from './errors'
import mockHost from '$lib/common/hosts/mock'

export const records: Writable<Record<string, any>[]> = writable([])
export const currentRecord: Writable<Record<string, any>> = writable({})

selectedModel.subscribe((model) => {
  currentRecord.set(initValues(model?.properties || {}))
})

async function validateRecord(record: Record<string, any>) {
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

export async function addRecord(record: Record<string, any>): Promise<void> {
  const valid = await validateRecord(record)

  if (!valid) return

  // send record to the backend
  await mockHost
    .addRecord(get(selectedModel), record)
    .then((newRecord) => {
      // add new record to the store if backend call was successful
      records.update((records) => [...records, newRecord])
      alert('Record added successfully')
    })
    .catch((error) => {
      // store errors in the store to display them in the UI
      errors.set(error)
    })

  return
}

export function removeRecord(record: Record<string, any>) {
  records.update((records) => records.filter((r) => r !== record))
}

export function updateRecord(record: Record<string, any>) {
  records.update((records) => records.map((r) => (r === record ? record : r)))
}
