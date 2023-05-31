import type { EventSourcedRecordGraphStore } from './EventSourcedRecordGraphStore'
import type { RecordControls, SubGraphCollectorsByRecordId } from './RecordControls'
import type { Writable } from 'svelte/store'
import type {
  DataRecordId,
  Id,
  Model,
  RecordGraphEdge,
  SystemConfiguration,
} from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { justErrorMessage } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'
import type { ErrorVisibilityByRecordId } from './helpers'
import type { RecordSaver } from '../backend/Backend'
import type { EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import { eventSourcedRecordGraphFns } from '@cozemble/model-event-sourced'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'

function recordSaveTimestamp(
  lastSavedByRecordId: Writable<Map<string, number>>,
  record: EventSourcedDataRecord,
): void {
  lastSavedByRecordId.update((lastSaved) => {
    lastSaved.set(record.record.id.value, Date.now())
    return lastSaved
  })
}

export function makeRecordControls(
  systemConfigurationProvider: () => SystemConfiguration,
  recordSaver: RecordSaver,
  modelsProvider: () => Model[],
  errorVisibilityByRecordId: Writable<ErrorVisibilityByRecordId>,
  recordGraph: EventSourcedRecordGraphStore,
  lastSavedByRecordId: Writable<Map<string, number>>,
  subGraphCollectorsByRecordId: SubGraphCollectorsByRecordId,
): RecordControls {
  function validateRecord(record: EventSourcedDataRecord): JustErrorMessage | null {
    const errors = modelFns.validate(systemConfigurationProvider(), modelsProvider(), record.record)
    errorVisibilityByRecordId.update((recordErrorsById) => {
      recordErrorsById.set(record.record.id.value, errors.size > 0)
      return recordErrorsById
    })
    if (errors.size > 0) {
      return justErrorMessage(`${errors.size} error(s) when saving record`)
    }
    return null
  }

  async function performRecordSave(
    saveFunction: (
      newRecord: EventSourcedDataRecord,
      edges: RecordGraphEdge[],
      deletedEdges: Id[],
    ) => Promise<RecordSaveOutcome>,
    recordId: DataRecordId,
  ): Promise<JustErrorMessage | null> {
    const record = eventSourcedRecordGraphFns.recordWithId(recordGraph.get(), recordId)
    const maybeError = validateRecord(record)
    if (maybeError) {
      return maybeError
    }

    const saveOutcome = await saveFunction(
      record,
      eventSourcedRecordGraphFns.getEdgesInvolvingRecord(recordGraph.get(), recordId),
      recordGraph.get().deletedEdges.map((e) => e.edge.id),
    )
    if (saveOutcome._type === 'record.save.failed') {
      return justErrorMessage(saveOutcome.errors[0] ?? 'Unknown error when saving record')
    }
    recordSaveTimestamp(lastSavedByRecordId, record)
    return null
  }

  return {
    async saveRecord(recordId: DataRecordId) {
      return await performRecordSave(recordSaver.saveExistingRecord, recordId)
    },
    async saveNewRecord(recordId: DataRecordId) {
      const maybeError = await performRecordSave(recordSaver.saveNewRecord, recordId)
      if (maybeError) {
        return maybeError
      }
      recordGraph.appendNewRecord()
      return null
    },
  }
}
