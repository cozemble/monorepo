import type { Backend } from './Backend'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'

export class ConsoleLoggingBackend implements Backend {
  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    console.log('saveModel', model)
    return null
  }

  async saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    console.log('saveModels', model)
    return null
  }

  async getRecords(modelId: ModelId): Promise<DataRecord[]> {
    console.log('getRecords', modelId)
    return []
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    return recordSaveSucceeded(newRecord.record)
  }
}
