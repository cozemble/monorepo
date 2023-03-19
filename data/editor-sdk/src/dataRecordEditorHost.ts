import { mandatory } from '@cozemble/lang-util'
import { DataRecord, Model, ModelId, ModelView } from '@cozemble/model-core'
import { DataRecordControlEvent, DataRecordEditEvent } from './dataRecordEditEvents'
import { getContext, setContext } from 'svelte'

const dataRecordEditorClientContext = 'com.cozemble.data.record.editor.client.context'

export interface DataRecordEditorClient {
  createNewRecord(modelId: ModelId): Promise<DataRecord | null>

  dispatchControlEvent(event: DataRecordControlEvent): void

  dispatchEditEvent(event: DataRecordEditEvent): void

  searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]>

  getModelViews(modelId: ModelId): ModelView[]

  getModels(): Model[]
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
