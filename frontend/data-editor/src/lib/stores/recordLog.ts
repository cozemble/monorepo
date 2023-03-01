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

/** To debounce the logging of the record and be able to cancel the timeout */
let debounceAction: NodeJS.Timeout

currentRecord.subscribe((recordStore) => {
  const record = { ...recordStore } // clone to avoid mutation

  // Clear the timeout action if it exists
  if (debounceAction) clearTimeout(debounceAction)

  debounceAction = setTimeout(() => {
    const oldRecord = get(recordLog)[0]?.record

    console.log(
      'difference',
      oldRecord && { from: getDifference(record, oldRecord), to: getDifference(oldRecord, record) },
    )

    recordLog.update((log) => {
      return [...log, createHistoryLog(record)]
    })
  }, LOG_TIMEOUT)
})
