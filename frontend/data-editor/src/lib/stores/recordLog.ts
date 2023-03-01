import type { Writable } from 'svelte/store'
import { writable, get } from 'svelte/store'
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

export const recordLog: Writable<Record<string, any>[]> = writable([])

export const lastSavedRecord: Writable<Record<string, any>> = writable({})

/** To debounce the logging of the record and be able to cancel the timeout */
let debounceAction: NodeJS.Timeout

currentRecord.subscribe((recordStore) => {
  const record = { ...recordStore } // clone to avoid mutation

  // Clear the timeout action if it exists
  if (debounceAction) clearTimeout(debounceAction)

  debounceAction = setTimeout(() => {
    recordLog.update((log) => {
      return [...log, createHistoryLog(record)]
    })
  }, LOG_TIMEOUT)
})

export const getDifferenceFromLastSavedRecord = (record: Record<string, any>) => {
  const oldRecord = get(lastSavedRecord)

  return {
    from: getDifference(record, oldRecord),
    to: getDifference(oldRecord, record),
  }
}

/** Go back to the previous record and remove the last record from the log */
export const takeBack = () => {
  recordLog.update((log) => {
    const lastRecord = _.last(log)

    if (!lastRecord) return log

    currentRecord.set(_.nth(log, -2)?.record || {})

    clearTimeout(debounceAction) // cancel logging the record to prevent duplicates
    return log.slice(0, -1) // remove the last record
  })
}
