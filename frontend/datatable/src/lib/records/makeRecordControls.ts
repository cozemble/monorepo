import type { EventSourcedRecordGraphStore } from './EventSourcedRecordGraphStore'
import type { RecordControls, SubGraphCollectorsByRecordId } from './RecordControls'
import { subGraphCollectorFns } from './RecordControls'
import type { Writable } from 'svelte/store'
import type {
  DataRecord,
  DataRecordId,
  Id,
  Model,
  RecordGraphEdge,
  SystemConfiguration,
} from '@cozemble/model-core'
import type { JustErrorMessage, SuccessfulOutcome } from '@cozemble/lang-util'
import { justErrorMessage, objects } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'
import type { ErrorVisibilityByRecordId } from './helpers'
import type { RecordSaver } from '../backend/Backend'
import type { EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import {
  type EventSourcedRecordGraph,
  eventSourcedRecordGraphFns,
  timestampedRecordGraphEdgeFns,
} from '@cozemble/model-event-sourced'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { mergeSubGraphs } from '$lib/records/modelReferences/mergeSubGraphs'

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

  function applyServerSideChanges(saveOutcome: SuccessfulOutcome<DataRecord[]>) {
    recordGraph.update((graph) => {
      return {
        ...graph,
        records: [
          ...graph.records.map((esr) => {
            const record =
              saveOutcome.value.find((r) => r.id.value === esr.record.id.value) ?? esr.record
            if (!objects.sameJson(esr.record, record)) {
              return { ...esr, record }
            }
            return esr
          }),
        ],
      }
    })
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
    const edges = eventSourcedRecordGraphFns.getEdgesInvolvingRecord(recordGraph.get(), recordId)
    const deletedEdges = recordGraph.get().deletedEdges

    const initialGraph: EventSourcedRecordGraph = {
      ...eventSourcedRecordGraphFns.empty(),
      records: [record],
      edges: edges.map((e) => timestampedRecordGraphEdgeFns.newInstance(e)),
      deletedEdges,
    }
    const flattenedGraph = mergeSubGraphs(recordId, initialGraph, subGraphCollectorsByRecordId)

    const saveOutcome = await recordSaver.upsertRecords(
      flattenedGraph.records,
      flattenedGraph.edges.map((e) => e.edge),
      flattenedGraph.deletedEdges.map((e) => e.edge.id),
    )
    console.log({ saveOutcome })
    if (saveOutcome._type === 'unsuccessful.outcome') {
      if (saveOutcome.error._type === 'record.data.error') {
        return justErrorMessage(`Error saving record ${saveOutcome.error.recordId.value}`)
      } else {
        return saveOutcome.error
      }
    }
    recordSaveTimestamp(lastSavedByRecordId, record)
    applyServerSideChanges(saveOutcome)
    subGraphCollectorsByRecordId[recordId.value] = subGraphCollectorFns.empty()
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
