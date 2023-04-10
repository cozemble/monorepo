import { mandatory } from '@cozemble/lang-util'
import { DataRecord, Model, ModelId, ModelView } from '@cozemble/model-core'
import { DataRecordControlEvent, DataRecordEditEvent } from './dataRecordEditEvents'
import { getContext, setContext } from 'svelte'

const dataRecordEditorClientContext = 'com.cozemble.data.record.editor.client.context'

export interface Size {
  width: number
  height: number
}

export interface UploadedAttachment {
  _type: 'uploaded.attachment'
  attachmentId: string
  file: File
  size: Size | null
  thumbnailUrl: string | null
}

export interface AttachmentIdAndFileName {
  attachmentId: string
  fileName: string
}

export interface DataRecordEditorClient {
  dispatchControlEvent(event: DataRecordControlEvent): void

  dispatchEditEvent(event: DataRecordEditEvent): void

  createNewRecord(modelId: ModelId): Promise<DataRecord | null>

  searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]>

  getModels(): Model[]

  getModelViews(modelId: ModelId): ModelView[]

  uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]>

  deleteAttachments(attachmentIds: string[]): Promise<void>

  getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]>
}

export const dataRecordEditor = {
  getClient: (): DataRecordEditorClient => {
    return mandatory(
      getContext(dataRecordEditorClientContext),
      `No data record editor client found in context`,
    )
  },
}
export const dataRecordEditorHost = {
  setClient: (client: DataRecordEditorClient) => {
    return setContext(dataRecordEditorClientContext, client)
  },
}
