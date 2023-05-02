import type { Backend } from '../backend/Backend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { allEventSourcedModels } from '../stores/allModels'
import type { DataRecord, ModelId } from '@cozemble/model-core'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { ModelView } from '@cozemble/model-core/dist/esm'
import { allModelViews } from '../stores/allModelViews'

export class StoreSyncBackend implements Backend {
  constructor(private readonly delegate: Backend) {}

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    const result = await this.delegate.saveModel(model)
    if (result === null) {
      allEventSourcedModels.update((ms) => {
        const index = ms.findIndex((m) => m.model.id.value === model.model.id.value)
        if (index === -1) {
          return [...ms, model]
        }
        const newMs = [...ms]
        newMs[index] = model
        return newMs
      })
    }
    return result
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    return await this.delegate.saveModels(models)
  }

  async getRecords(modelId: ModelId): Promise<DataRecord[]> {
    return await this.delegate.getRecords(modelId)
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    return await this.delegate.saveNewRecord(newRecord)
  }

  async saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    return await this.delegate.saveNewRecord(record)
  }

  async searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
    return await this.delegate.searchRecords(modelId, search)
  }

  async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
    const outcome = await this.delegate.saveModelView(modelView)
    console.log({ outcome })
    if (outcome !== null) {
      return outcome
    }
    allModelViews.update((mvs) => {
      const maybeExisting = mvs.find((mv) => mv.modelId.value === modelView.modelId.value)
      if (maybeExisting) {
        return mvs.map((mv) => {
          if (mv.modelId.value === modelView.modelId.value) {
            return modelView
          }
          return mv
        })
      }
      return [...mvs, modelView]
    })
    return outcome
  }
}
