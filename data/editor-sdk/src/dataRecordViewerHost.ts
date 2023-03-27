import { mandatory } from '@cozemble/lang-util'
import { DataRecord, DataRecordId, Model, ModelId, ModelView } from '@cozemble/model-core'
import { getContext, setContext } from 'svelte'
import { AttachmentIdAndFileName } from './dataRecordEditorHost'

const dataRecordViewerClientContext = 'com.cozemble.data.record.viewer.client.context'

export interface DataRecordViewerClient {
  getModelViews(modelId: ModelId): ModelView[]

  getModels(): Model[]

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null>

  getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]>
}

export const dataRecordViewer = {
  getClient: (): DataRecordViewerClient => {
    return mandatory(
      getContext(dataRecordViewerClientContext),
      `No data record viewer client found in context`,
    )
  },
}
export const dataRecordViewerHost = {
  setClient: (client: DataRecordViewerClient) => {
    return setContext(dataRecordViewerClientContext, client)
  },
}
