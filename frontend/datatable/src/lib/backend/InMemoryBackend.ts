import type { Backend } from './Backend'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'

export class InMemoryBackend implements Backend {
  private readonly models: Map<string, EventSourcedModel>
  private readonly records: Map<string, DataRecord[]>

  constructor() {
    this.models = new Map()
    this.records = new Map()
  }

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    console.log('saveModel', model)
    this.models.set(model.model.id.value, model)
    return null
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    console.log('saveModels', models)
    models.forEach((model) => this.models.set(model.model.id.value, model))
    return null
  }

  async getRecords(modelId: ModelId): Promise<DataRecord[]> {
    console.log('getRecords', modelId)
    const records = this.records.get(modelId.value)
    console.log({ modelId, records, storedRecords: this.records })
    return records || []
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const existingRecords = this.records.get(newRecord.record.modelId.value) || []
    const updatedRecords = [...existingRecords, newRecord.record]
    this.records.set(newRecord.record.modelId.value, updatedRecords)
    console.log({ models: this.models, records: this.records })
    return recordSaveSucceeded(newRecord.record)
  }
}
