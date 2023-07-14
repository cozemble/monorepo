import { mandatory, Option } from '@cozemble/lang-util'
import {
  DataRecord,
  DataRecordId,
  Model,
  ModelId,
  ModelName,
  ModelView,
  RecordAndEdges,
} from '@cozemble/model-core'
import { getContext, setContext } from 'svelte'
import { ModelViewManager } from './ModelViewManager.js'
import {
  DataRecordControlEvent,
  DataRecordEditEvent,
  EventSourcedRecordGraph,
} from '@cozemble/model-event-sourced'
import { RecordsAndEdges } from '@cozemble/model-core'

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

export interface SetupSummaryViewUserInstruction {
  _type: 'setup.summary.view.user.instruction'
  modelName: ModelName
}

export interface UserInstruction {
  _type: 'user.instruction'
  userContextMessage: string
  detail: SetupSummaryViewUserInstruction
}

export const userInstructionFns = {
  setupSummaryView: (userContextMessage: string, modelName: ModelName): UserInstruction => {
    return {
      _type: 'user.instruction',
      userContextMessage,
      detail: {
        _type: 'setup.summary.view.user.instruction',
        modelName,
      },
    }
  },
}

// @ts-ignore
export type RecordGraphModifier = Option<EventSourcedRecordGraph>

export interface DataRecordEditorClient extends ModelViewManager {
  recordById(modelId: ModelId, recordId: DataRecordId): Promise<RecordAndEdges | null>

  dispatchControlEvent(event: DataRecordControlEvent): void

  dispatchEditEvent(event: DataRecordEditEvent): void

  createNewRootRecord(
    modelId: ModelId,
    ...modifiers: RecordGraphModifier[]
  ): Promise<EventSourcedRecordGraph | null>

  searchRecords(modelId: ModelId, search: string): Promise<RecordsAndEdges>

  getModels(): Model[]

  getModelViews(modelId: ModelId): ModelView[]

  uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]>

  deleteAttachments(attachmentIds: string[]): Promise<void>

  getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]>

  instructUser(userInstruction: UserInstruction): void
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
