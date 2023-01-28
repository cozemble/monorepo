import type { Writable } from 'svelte/store'

import { writable } from 'svelte/store'

export const records: Writable<Record<string, any>[]> = writable([])

export function addRecord(record: Record<string, any>) {
  records.update((records) => [...records, record])
}

export function removeRecord(record: Record<string, any>) {
  records.update((records) => records.filter((r) => r !== record))
}

export function updateRecord(record: Record<string, any>) {
  records.update((records) => records.map((r) => (r === record ? record : r)))
}
