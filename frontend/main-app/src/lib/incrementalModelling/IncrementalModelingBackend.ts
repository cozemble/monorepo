import type { DataTableBackend, FilterParams } from '@cozemble/frontend-datatable'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { justErrorMessage } from '@cozemble/lang-util'
import type {
  DataRecord,
  DataRecordId,
  Model,
  ModelId,
  ModelView,
  RecordGraph,
} from '@cozemble/model-core'
import { recordGraphFns } from '@cozemble/model-core'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type {
  AttachmentIdAndFileName,
  EventSourcedDataRecord,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type { Backend } from '@cozemble/frontend-bff'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import { toFilledFilterInstanceGroup } from '@cozemble/frontend-ui-blocks'
import { recordGraphNodeFns } from '@cozemble/model-core/dist/esm'

export class IncrementalModelingBackend implements DataTableBackend {
  constructor(
    private readonly backend: Backend,
    private readonly tenantId: string,
    private readonly modelsProvider: () => Model[],
  ) {}

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    return this.saveModels([model])
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    try {
      const backendModels: BackendModel[] = models.map((m) => ({
        _type: 'backend.model',
        model: m.model,
        events: m.events,
      }))
      await this.backend.putModels(this.tenantId, backendModels)
      return null
    } catch (e: any) {
      return justErrorMessage(e.message)
    }
  }

  async getRecords(modelId: ModelId, filterParams: FilterParams): Promise<RecordGraph> {
    const filled = toFilledFilterInstanceGroup(filterParams.filters)
    const fetched = await this.backend.fetchRecords(
      this.tenantId,
      modelId.value,
      filterParams.search,
      filled,
    )
    return recordGraphFns.newInstance(
      fetched.records.map((r) => recordGraphNodeFns.newInstance(r, [])),
    )
  }

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    return this.backend.saveRecord(this.tenantId, this.modelsProvider(), newRecord)
  }

  saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    return this.backend.saveRecord(this.tenantId, this.modelsProvider(), record)
  }

  async searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
    const fetched = await this.backend.fetchRecords(this.tenantId, modelId.value, search, null)
    return fetched.records
  }

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
    return this.backend.findRecordById(this.tenantId, modelId, recordId)
  }

  async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
    await this.backend.saveEntities(this.tenantId, [modelView])
    return null
  }

  uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    return this.backend.uploadAttachments(this.tenantId, files, progressUpdater)
  }

  deleteAttachments(attachmentIds: string[]): Promise<void> {
    return this.backend.deleteAttachments(this.tenantId, attachmentIds)
  }

  getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
    return this.backend.getAttachmentViewUrls(this.tenantId, attachmentIds)
  }
}
