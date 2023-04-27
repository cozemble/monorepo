import { type Backend, notImplementedBackend } from './backend/Backend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { RecordsContext } from './records/RecordsContext'
import type { DataRecord, ModelId, SystemConfiguration } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import type { AttachmentsManager, RecordSearcher } from '@cozemble/data-paginated-editor'
import type {
  AttachmentIdAndFileName,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk/dist/esm'

let backend = notImplementedBackend

export const backendFns = {
  setBackend: (newBackend: Backend) => {
    backend = newBackend
  },
}

export async function saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
  return backend.saveModel(model)
}

export async function saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
  return backend.saveModels(models)
}

export function recordsContext(
  systemConfiguration: SystemConfiguration,
  models: Writable<EventSourcedModel[]>,
  modelId: ModelId,
): RecordsContext {
  return new RecordsContext(backend, systemConfiguration, modelId, models, [])
}

export const recordSearcher: RecordSearcher = {
  async recordById(modelId, recordId): Promise<DataRecord | null> {
    throw new Error('Not implemented')
  },
  async searchRecords(modelId, searchTerm: string): Promise<DataRecord[]> {
    throw new Error('Not implemented')
  },
}

export const attachmentsManager: AttachmentsManager = {
  async uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    throw new Error('Not implemented')
  },

  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    throw new Error('Not implemented')
  },

  async getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
    throw new Error('Not implemented')
  },
}
