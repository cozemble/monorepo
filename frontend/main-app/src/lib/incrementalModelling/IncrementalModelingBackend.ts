import type { Backend as DataTableBackend, FilterParams } from '@cozemble/frontend-datatable'
import type { EventSourcedDataRecord, EventSourcedModel } from '@cozemble/model-event-sourced'
import {
  eventSourcedDataRecordFns,
  type EventSourcedRecordGraph,
  eventSourcedRecordGraphFns,
  timestampedRecordGraphEdgeFns,
} from '@cozemble/model-event-sourced'
import type { JustErrorMessage, Outcome } from '@cozemble/lang-util'
import { justErrorMessage, outcomeFns } from '@cozemble/lang-util'
import type {
  DataRecord,
  DataRecordId,
  Id,
  Model,
  ModelId,
  ModelView,
  RecordAndEdges,
  RecordGraphEdge,
  RecordsAndEdges,
} from '@cozemble/model-core'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { Backend, RecordSaveFailure } from '@cozemble/frontend-bff'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import { toFilledFilterInstanceGroup } from '@cozemble/frontend-ui-blocks'

export class IncrementalModelingBackend implements DataTableBackend {
  constructor(
    private readonly backend: Backend,
    private readonly tenantId: string,
    private readonly modelsProvider: () => Model[],
  ) {}

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    return this.saveModels([model])
  }

  async saveNewGraph(graph: EventSourcedRecordGraph): Promise<Outcome<EventSourcedRecordGraph>> {
    const lastIndex = graph.records.length - 1
    for (let i = 0; i < graph.records.length; i++) {
      if (i === lastIndex) {
        await this.saveNewRecord(
          graph.records[i],
          graph.edges.map((e) => e.edge),
          graph.deletedEdges.map((e) => e.edge.id),
        )
      } else {
        await this.saveNewRecord(graph.records[i], [], [])
      }
    }
    return outcomeFns.successful(graph)
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

  async getRecords(modelId: ModelId, filterParams: FilterParams): Promise<EventSourcedRecordGraph> {
    const filled = toFilledFilterInstanceGroup(filterParams.filters)
    const fetched = await this.backend.fetchRecords(
      this.tenantId,
      modelId.value,
      filterParams.search,
      filled,
    )
    return eventSourcedRecordGraphFns.newInstance(
      fetched.records.map((r) => eventSourcedDataRecordFns.fromRecord(this.modelsProvider(), r)),
      fetched.edges.map((e) => timestampedRecordGraphEdgeFns.newInstance(e)),
      [],
    )
  }

  saveNewRecord(
    newRecord: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome> {
    return this.backend.saveRecord(
      this.tenantId,
      this.modelsProvider(),
      newRecord,
      edges,
      deletedEdges,
    )
  }

  saveExistingRecord(
    record: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome> {
    return this.backend.saveRecord(
      this.tenantId,
      this.modelsProvider(),
      record,
      edges,
      deletedEdges,
    )
  }

  async upsertRecords(
    records: EventSourcedDataRecord[],
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<Outcome<DataRecord[], RecordSaveFailure>> {
    return this.backend.saveRecords(
      this.tenantId,
      this.modelsProvider(),
      records,
      edges,
      deletedEdges,
    )
  }

  async searchRecords(modelId: ModelId, search: string): Promise<RecordsAndEdges> {
    return await this.backend.fetchRecords(this.tenantId, modelId.value, search, null)
  }

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<RecordAndEdges | null> {
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
