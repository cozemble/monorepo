import type { Backend } from './Backend'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'

export class InMemoryBackend implements Backend {
  constructor(
    private readonly models: Map<string, EventSourcedModel> = new Map(),
    private readonly records: Map<string, DataRecord[]> = new Map(),
  ) {}

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    this.models.set(model.model.id.value, model)
    return null
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    models.forEach((model) => this.models.set(model.model.id.value, model))
    return null
  }

  async getRecords(modelId: ModelId): Promise<DataRecord[]> {
    const records = this.records.get(modelId.value)
    return records || []
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const existingRecords = this.records.get(newRecord.record.modelId.value) || []
    const updatedRecords = [...existingRecords, newRecord.record]
    this.records.set(newRecord.record.modelId.value, updatedRecords)
    return recordSaveSucceeded(newRecord.record)
  }
}
