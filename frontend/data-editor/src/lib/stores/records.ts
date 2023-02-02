import type { Writable } from 'svelte/store'
import type { Schema } from 'ajv'

import { writable, get } from 'svelte/store'
import Ajv from 'ajv'

import { removeEmptyValues } from '$lib/utils'
import { selectedModel } from './models'

export const records: Writable<Record<string, any>[]> = writable([])

export function addRecord(record: Record<string, any>) {
  record = removeEmptyValues(record)

  console.log(record)

  // create ajv instance
  const ajv = new Ajv({
    allErrors: true,
  })

  const validate = ajv.compile(get(selectedModel))
  const valid = validate(record)

  console.log('valid: ', valid)

  if (!valid) {
    console.error(validate.errors)
    return
  }

  records.update((records) => [...records, record])
}

export function removeRecord(record: Record<string, any>) {
  records.update((records) => records.filter((r) => r !== record))
}

export function updateRecord(record: Record<string, any>) {
  records.update((records) => records.map((r) => (r === record ? record : r)))
}
