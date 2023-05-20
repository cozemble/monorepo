import { mandatory } from '@cozemble/lang-util'
import { DataRecord, DataRecordId, Model, ModelId } from '@cozemble/model-core'
import { getContext, setContext } from 'svelte'
import { AttachmentIdAndFileName, UserInstruction } from './dataRecordEditorHost'
import { ModelViewManager } from './ModelViewManager'
import { DataRecordEditEvent } from '@cozemble/model-event-sourced'

const dataRecordViewerClientContext = 'com.cozemble.data.record.viewer.client.context'

export interface DataRecordViewerClient extends ModelViewManager {
  getModels(): Model[]

  searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]>

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null>

  getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]>

  dispatchEditEvent(event: DataRecordEditEvent): void

  instructUser(userInstruction: UserInstruction): void
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
