import type { Backend, FilterParams } from '../backend/Backend'
import type {
  EventSourcedDataRecord,
  EventSourcedModel,
  EventSourcedRecordGraph,
} from '@cozemble/model-event-sourced'
import type { JustErrorMessage, Outcome } from '@cozemble/lang-util'
import { allEventSourcedModels } from '../stores/allModels'
import type { DataRecord, DataRecordId, ModelId, ModelView } from '@cozemble/model-core'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { allModelViews } from '../stores/allModelViews'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { RecordGraphEdge } from '@cozemble/model-core'

export class StoreSyncBackend implements Backend {
  constructor(private readonly delegate: Backend) {}

  async saveNewGraph(graph: EventSourcedRecordGraph): Promise<Outcome<EventSourcedRecordGraph>> {
    return await this.delegate.saveNewGraph(graph)
  }

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    const result = await this.delegate.saveModel(model)
    if (result === null) {
      allEventSourcedModels.update((list) => {
        const index = list.models.findIndex((m) => m.model.id.value === model.model.id.value)
        if (index === -1) {
          return { ...list, models: [...list.models, model] }
        }
        const newModels = [...list.models]
        newModels[index] = model
        return { ...list, models: newModels }
      })
    }
    return result
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    return await this.delegate.saveModels(models)
  }

  async getRecords(modelId: ModelId, filterParams: FilterParams): Promise<EventSourcedRecordGraph> {
    return await this.delegate.getRecords(modelId, filterParams)
  }

  async saveNewRecord(
    newRecord: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
  ): Promise<RecordSaveOutcome> {
    return await this.delegate.saveNewRecord(newRecord, edges, [])
  }

  async saveExistingRecord(
    record: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
  ): Promise<RecordSaveOutcome> {
    return await this.delegate.saveExistingRecord(record, edges, [])
  }

  async searchRecords(modelId: ModelId, search: string) {
    return await this.delegate.searchRecords(modelId, search)
  }

  async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
    const outcome = await this.delegate.saveModelView(modelView)
    if (outcome !== null) {
      return outcome
    }
    allModelViews.update((mvs) => {
      const maybeExisting = mvs.find((mv) => mv.id.value === modelView.id.value)
      if (maybeExisting) {
        return mvs.map((mv) => {
          if (mv.id.value === modelView.id.value) {
            return modelView
          }
          return mv
        })
      }
      return [...mvs, modelView]
    })
    return outcome
  }

  async recordById(modelId: ModelId, recordId: DataRecordId) {
    return await this.delegate.recordById(modelId, recordId)
  }

  async uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    return await this.delegate.uploadAttachments(files, progressUpdater)
  }

  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    return await this.delegate.deleteAttachments(attachmentIds)
  }

  async getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
    return await this.delegate.getAttachmentViewUrls(attachmentIds)
  }
}
