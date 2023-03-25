import type { Writable } from 'svelte/store'

import { writable, get } from 'svelte/store'
import Ajv from 'ajv'
import _ from 'lodash'

import { removeEmptyValues, initValues, getDifference } from '$lib/utils'
import { selectedModel } from './models'
import { addErrors } from '$lib/stores/errors'
import { removeFormulaFields } from '$lib/helpers/records'

export const currentRecord: Writable<ObjectValue> = writable({})

//

// * Version logging

const LOG_TIMEOUT = 1000

export const recordLogs: Writable<ObjectValue[]> = writable([])

/** To debounce the logging of the record and be able to cancel the timeout */
let currentTimeout: NodeJS.Timeout

/** Create a log of the record and add it to the recordLogs store
 * - Clones the record by itself to prevent mutation of the log
 */
function createLog(record: ObjectValue) {
  recordLogs.update((logs) => {
    // need to clone first to prevent mutations
    const lastLog = _.last(_.cloneDeep(logs))
    const currentRecord = _.cloneDeep(record)

    // no need to log if the record is the same as the last log
    if (lastLog && _.isEqual(record, lastLog)) return logs

    // mutate the last item if a formula field was changed

    const withoutFormulas = {
      currentRecord: removeFormulaFields(currentRecord, get(selectedModel)) as ObjectValue,
      lastLog: removeFormulaFields(lastLog, get(selectedModel)) as ObjectValue,
    }

    if (_.isEqual(withoutFormulas.currentRecord, withoutFormulas.lastLog)) {
      logs[logs.length - 1] = currentRecord
      return logs
    }

    console.warn('record logged')

    return [...logs, currentRecord]
  })
}

selectedModel.subscribe((model) => {
  currentRecord.set(<ObjectValue>initValues(model))

  recordLogs.set([])

  createLog(_.cloneDeep(get(currentRecord)))
})

/** Store the record that is awaiting to be logged */
let awaitingRecord: Record<string, any> | null = null

/** Store the changes that are awaiting to be logged*/
let awaitingChanges: Record<string, any> | null = null

// listen to changes in the record and log them
currentRecord.subscribe((record) => {
  console.warn('record changed', record.invoiceNumber)

  // TODO if user switches to editing a different property before the timeout is over, version before the next property is edited should be logged

  const lastLog = _.cloneDeep(_.last(get(recordLogs)))

  const changes = getDifference(_.cloneDeep(record), lastLog)

  const changesComparisonObject = _.defaultsDeep(_.cloneDeep(awaitingChanges), changes)

  // if the record changed but the changes are on different properties, log the previous changes immediately
  if (awaitingChanges && !_.isEqual(awaitingChanges, changesComparisonObject)) {
    console.warn('record changed on different properties')
    console.log('awaitingChanges', awaitingChanges)
    console.log('changes', changes)
    console.log('changesComparisonObject', changesComparisonObject)

    clearTimeout(currentTimeout)
    if (awaitingRecord) createLog(awaitingRecord)

    awaitingRecord = null
    awaitingChanges = null
  }

  // Clear the timeout action if it exists to keep debouncing
  if (currentTimeout) clearTimeout(currentTimeout)

  awaitingRecord = _.cloneDeep(record)
  awaitingChanges = getDifference(awaitingRecord, lastLog) as ObjectValue

  currentTimeout = setTimeout(() => {
    createLog(awaitingRecord as ObjectValue)

    awaitingChanges = null
    awaitingRecord = null
  }, LOG_TIMEOUT)
})

/** Go back to the previous record and remove the last record from the log */
export const takeBack = async () => {
  const logs = [...get(recordLogs)]

  if (logs.length < 2) return // can't take back if there is only one record

  recordLogs.set(logs.slice(0, -1))
  currentRecord.set({ ...logs[logs.length - 2] })
  clearTimeout(currentTimeout)
}

//

// * Last saved record

export const lastSavedRecord: Writable<ObjectValue> = writable({})

selectedModel.subscribe((model) => {
  lastSavedRecord.set(<ObjectValue>initValues(model))
})

export const getDifferenceFromLastSavedRecord = (record: ObjectValue) => ({
  from: getDifference(_.cloneDeep(get(lastSavedRecord)), _.cloneDeep(record)),
  to: getDifference(_.cloneDeep(record), _.cloneDeep(get(lastSavedRecord))),
})

//

// * Validation

export async function validateRecord(record: ObjectValue) {
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

recordLogs.subscribe((logs) => {
  console.table(logs.map((l) => l.invoiceNumber))
})
