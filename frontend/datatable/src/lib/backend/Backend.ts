import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'

export interface Backend {
  saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null>

  getRecords(modelId: ModelId): Promise<DataRecord[]>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>
}

export const notImplementedBackend: Backend = {
  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },
  saveModel: async (model) => {
    throw new Error('Not implemented')
  },
  saveModels: async (models) => {
    throw new Error('Not implemented')
  },
  getRecords: async (modelId) => {
    throw new Error('Not implemented')
  },
}
