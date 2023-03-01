import type { Writable, Readable } from 'svelte/store'
import { writable, derived, get } from 'svelte/store'
import _ from 'lodash'

import { getDifference } from '$lib/utils'
import { currentRecord } from './records'

const LOG_TIMEOUT = 1000

const createHistoryLog = (record: Record<string, any>) => {
  return {
    timestamp: new Date().toISOString(),
    record,
  }
}

// * Stores

export const recordLog: Writable<Record<string, any>[]> = writable([])

/** Easy access to the timestamp of the last saved record */
const lastSaved: Readable<number> = derived(recordLog, ($recordLog) => {
  const lastLog = $recordLog[$recordLog.length - 1]
  if (!lastLog) return new Date(0).getTime()

  return new Date(lastLog.timestamp).getTime()
})

//

currentRecord.subscribe((recordStore) => {
  const record = { ...recordStore } // clone to avoid mutation

  // TODO change this to a debounce
  if (get(lastSaved) + LOG_TIMEOUT > new Date().getTime()) return

  const oldRecord = get(recordLog)[0]?.record

  console.log('difference', oldRecord && getDifference(oldRecord, record))

  recordLog.update((log) => {
    return [...log, createHistoryLog(record)]
  })
})
