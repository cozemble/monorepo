import {
  DataRecord,
  ModelReference,
  TimestampEpochMillis,
  timestampEpochMillis,
} from '@cozemble/model-core'

export interface RecordReferencesChangedEvent {
  _type: 'record.references.changed.event'
  timestamp: TimestampEpochMillis
  recordBeingEdited: DataRecord
  modelReference: ModelReference
  selection: DataRecord[]
}

export type RecordGraphEvent = RecordReferencesChangedEvent

export const recordGraphEvents = {
  recordReferencesChanged: (
    recordBeingEdited: DataRecord,
    modelReference: ModelReference,
    selection: DataRecord[],
  ): RecordReferencesChangedEvent => ({
    _type: 'record.references.changed.event',
    timestamp: timestampEpochMillis(),
    recordBeingEdited,
    modelReference,
    selection,
  }),
}
