import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { ModelView } from '@cozemble/model-core'
import type { DataRecordId } from '@cozemble/model-core'

export interface Backend {
  saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null>

  getRecords(modelId: ModelId): Promise<DataRecord[]>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]>

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null>

  saveModelView(modelView: ModelView): Promise<JustErrorMessage | null>
}

export const notImplementedBackend: Backend = {
  saveNewRecord(): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },
  saveExistingRecord(): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },
  saveModel: async () => {
    throw new Error('Not implemented')
  },
  saveModels: async () => {
    throw new Error('Not implemented')
  },
  getRecords: async (modelId) => {
    throw new Error('Not implemented')
  },
  recordById: async () => {
    throw new Error('Not implemented')
  },
  async searchRecords(): Promise<DataRecord[]> {
    throw new Error('Not implemented')
  },
  async saveModelView(): Promise<JustErrorMessage | null> {
    throw new Error('Not implemented')
  },
}
