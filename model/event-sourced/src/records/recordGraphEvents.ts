import { DataRecord, ModelReference } from '@cozemble/model-core'

export interface RecordReferencesChangedEvent {
  _type: 'record.references.changed.event'
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
    recordBeingEdited,
    modelReference,
    selection,
  }),
}
