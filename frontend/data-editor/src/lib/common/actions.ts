import { get } from 'svelte/store'

import mockHost from '$lib/common/hosts/mock'

import { selectedModel } from '$lib/stores/models'
import { records, validateRecord } from '$lib/stores/records'
import { errors } from '$lib/stores/errors'
import { getDifferenceFromLastSavedRecord, lastSavedRecord } from '$lib/stores/recordLog'

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

export async function updateRecord(record: Record<string, any>): Promise<void> {
  const valid = await validateRecord(record)

  if (!valid) return

  // send record to the backend
  await mockHost
    .updateRecord(get(selectedModel), getDifferenceFromLastSavedRecord(record))
    .then((newRecord) => {
      // update record in the store if backend call was successful
      records.update((records) => records.map((r) => (r === record ? newRecord : r)))
      lastSavedRecord.set(newRecord)
      alert('Record updated successfully')
    })
    .catch((error) => {
      // store errors in the store to display them in the UI
      errors.set(error)
    })

  return
}
