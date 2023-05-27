import type { EventSourcedRecordGraphStore } from './EventSourcedRecordGraphStore'
import type { RecordControls } from './RecordControls'
import type { Writable } from 'svelte/store'
import type { DataRecordId, Model, SystemConfiguration } from '@cozemble/model-core'
import { justErrorMessage } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'
import type { ErrorVisibilityByRecordId } from './helpers'
import type { RecordSaver } from '../backend/Backend'
import { eventSourcedRecordGraphFns } from '@cozemble/model-event-sourced'

export function makeRecordControls(
  systemConfigurationProvider: () => SystemConfiguration,
  recordSaver: RecordSaver,
  modelsProvider: () => Model[],
  errorVisibilityByRecordId: Writable<ErrorVisibilityByRecordId>,
  recordGraph: EventSourcedRecordGraphStore,
  lastSavedByRecordId: Writable<Map<string, number>>,
  newUnsavedRecords = [] as DataRecordId[],
): RecordControls {
  return {
    async saveRecord(recordId: DataRecordId) {
      const record = eventSourcedRecordGraphFns.recordWithId(recordGraph.get(), recordId)
      const errors = modelFns.validate(
        systemConfigurationProvider(),
        modelsProvider(),
        record.record,
      )
      errorVisibilityByRecordId.update((recordErrorsById) => {
        recordErrorsById.set(record.record.id.value, errors.size > 0)
        return recordErrorsById
      })
      if (errors.size > 0) {
        return justErrorMessage(`${errors.size} error(s) when saving record`)
      }
      const indexOfNewUnsavedRecords = newUnsavedRecords.findIndex(
        (id) => id.value === recordId.value,
      )
      console.log({
        graph: recordGraph.get(),
        recordId,
        indexOfNewUnsavedRecords,
        newUnsavedRecords,
      })
      if (indexOfNewUnsavedRecords >= 0) {
        await recordSaver.saveNewRecord(
          record,
          eventSourcedRecordGraphFns.getEdgesInvolvingRecord(recordGraph.get(), recordId),
          recordGraph.get().deletedEdges.map((e) => e.edge.id),
        )
        // remove recordId from newUnsavedRecords
        newUnsavedRecords.splice(indexOfNewUnsavedRecords, 1)
      } else {
        await recordSaver.saveExistingRecord(
          record,
          eventSourcedRecordGraphFns.getEdgesInvolvingRecord(recordGraph.get(), recordId),
          recordGraph.get().deletedEdges.map((e) => e.edge.id),
        )
      }
      lastSavedByRecordId.update((lastSavedByRecordId) => {
        lastSavedByRecordId.set(record.record.id.value, Date.now())
        return lastSavedByRecordId
      })
      return null
    },
    async saveNewRecord(recordId: DataRecordId) {
      const record = eventSourcedRecordGraphFns.recordWithId(recordGraph.get(), recordId)
      const errors = modelFns.validate(
        systemConfigurationProvider(),
        modelsProvider(),
        record.record,
      )
      errorVisibilityByRecordId.update((recordErrorsById) => {
        recordErrorsById.set(record.record.id.value, errors.size > 0)
        return recordErrorsById
      })
      if (errors.size > 0) {
        return justErrorMessage(`${errors.size} error(s) when saving record`)
      }
      const indexOfNewUnsavedRecords = newUnsavedRecords.findIndex(
        (id) => id.value === recordId.value,
      )
      await recordSaver.saveNewRecord(
        record,
        eventSourcedRecordGraphFns.getEdgesInvolvingRecord(recordGraph.get(), recordId),
        recordGraph.get().deletedEdges.map((e) => e.edge.id),
      )
      // remove recordId from newUnsavedRecords
      newUnsavedRecords.splice(indexOfNewUnsavedRecords, 1)
      lastSavedByRecordId.update((lastSavedByRecordId) => {
        lastSavedByRecordId.set(record.record.id.value, Date.now())
        return lastSavedByRecordId
      })
      recordGraph.appendNewRecord()
      return null
    },
  }
}
