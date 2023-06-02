import {
  DataRecord,
  DataRecordId,
  ModelReference,
  timestampEpochMillis,
  TimestampEpochMillis,
} from '@cozemble/model-core'

export interface RecordReferencesChangedEvent {
  _type: 'record.references.changed.event'
  timestamp: TimestampEpochMillis
  recordBeingEdited: DataRecord
  modelReference: ModelReference
  selectedRecordIds: DataRecordId[]
}

export type RecordGraphEvent = RecordReferencesChangedEvent

export const recordGraphEvents = {
  recordReferencesChanged: (
    recordBeingEdited: DataRecord,
    modelReference: ModelReference,
    selectedRecordIds: DataRecordId[],
  ): RecordReferencesChangedEvent => ({
    _type: 'record.references.changed.event',
    timestamp: timestampEpochMillis(),
    recordBeingEdited,
    modelReference,
    selectedRecordIds,
  }),
}
