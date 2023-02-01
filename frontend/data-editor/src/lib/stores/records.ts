import type { Writable } from 'svelte/store'
import type { Schema } from 'jsonschema'

import { writable, get } from 'svelte/store'
import { validate } from 'jsonschema'

import { selectedModel } from './models'

export const records: Writable<Record<string, any>[]> = writable([])

export function addRecord(record: Record<string, any>) {
  // const validationResult = validate(record, get(selectedModel))

  // if (!validationResult.valid) {
  //   console.error(validationResult.errors)
  //   throw new Error('Invalid record')
  // }

  // records.update((records) => [...records, record])
  // ! validator has an issue with running on browser, probably

  console.log(record)
}

export function removeRecord(record: Record<string, any>) {
  records.update((records) => records.filter((r) => r !== record))
}

export function updateRecord(record: Record<string, any>) {
  records.update((records) => records.map((r) => (r === record ? record : r)))
}
