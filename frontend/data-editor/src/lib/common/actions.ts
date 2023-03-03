import { get } from 'svelte/store'

import mockHost from '$lib/common/hosts/mock'

import { selectedModel } from '$lib/stores/models'
import {
  validateRecord,
  getDifferenceFromLastSavedRecord,
  lastSavedRecord,
} from '$lib/stores/records'
import { errors } from '$lib/stores/errors'

export async function addRecord(record: Record<string, any>): Promise<void> {
  const valid = await validateRecord(record)

  if (!valid) return

  // send record to the backend
  await mockHost
    .addRecord(get(selectedModel), record)
    .then((newRecord) => {
      // add new record to the store if backend call was successful
      alert('Record added successfully')
    })
    .catch((error) => {
      // store errors in the store to display them in the UI
      errors.set(error)
    })

  return
}

export async function updateRecord(record: Record<string, any>): Promise<void> {
  const valid = await validateRecord(record)

  if (!valid) return

  // send record to the backend
  await mockHost
    .updateRecord(get(selectedModel), getDifferenceFromLastSavedRecord(record))
    .then((newRecord) => {
      // update record in the store if backend call was successful
      lastSavedRecord.set(newRecord)
      alert('Record updated successfully')
    })
    .catch((error) => {
      // store errors in the store to display them in the UI
      errors.set(error)
    })

  return
}
