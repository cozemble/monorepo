import { type Backend, type FilterParams, notImplementedBackend } from './backend/Backend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { RootRecordsContext } from './records/RecordsContext'
import type {
  DataRecord,
  DataRecordId,
  ModelId,
  RecordGraph,
  SystemConfiguration,
} from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import type {
  AttachmentsManager,
  RecordSaveOutcome,
  RecordSearcher,
} from '@cozemble/data-paginated-editor'
import type {
  AttachmentIdAndFileName,
  EventSourcedDataRecord,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import { StoreSyncBackend } from './app/StoreSyncBackend'

export let backend = notImplementedBackend

export const backendFns = {
  setBackend: (newBackend: Backend) => {
    backend = new StoreSyncBackend(newBackend)
    return backend
  },
}

export async function saveNewRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
  return backend.saveNewRecord(record)
}

export async function saveExistingRecord(
  record: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  return backend.saveExistingRecord(record)
}

export async function getRecordsForModel(
  modelId: ModelId,
  filterParams: FilterParams,
): Promise<RecordGraph> {
  return backend.getRecords(modelId, filterParams)
}

export async function saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
  return backend.saveModel(model)
}

export async function saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
  console.log({ models })
  return backend.saveModels(models)
}

export function rootRecordsContext(
  systemConfigurationProvider: () => SystemConfiguration,
  onError: (error: JustErrorMessage) => void,
  models: Writable<EventSourcedModel[]>,
  modelId: ModelId,
): RootRecordsContext {
  return new RootRecordsContext(backend, systemConfigurationProvider, onError, modelId, models)
}

export const recordSearcher: RecordSearcher = {
  async recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
    throw new Error('Not implemented')
  },
  async searchRecords(modelId: ModelId, searchTerm: string): Promise<DataRecord[]> {
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

export const defaultOnError = (error: JustErrorMessage) => {
  console.error(error)
}
