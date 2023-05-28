import type { Backend, FilterParams } from './Backend'
import type { JustErrorMessage, Outcome } from '@cozemble/lang-util'
import { outcomeFns, uuids } from '@cozemble/lang-util'
import type {
  EventSourcedDataRecord,
  EventSourcedModel,
  EventSourcedRecordGraph,
} from '@cozemble/model-event-sourced'
import {
  eventSourcedDataRecordFns,
  eventSourcedRecordGraphFns,
  type TimestampedRecordGraphEdge,
} from '@cozemble/model-event-sourced'
import type {
  DataRecord,
  DataRecordId,
  Model,
  ModelId,
  ModelView,
  RecordGraphEdge,
} from '@cozemble/model-core'
import {
  recordAndEdges,
  type RecordAndEdges,
  recordGraphEdgeFns,
  type RecordsAndEdges,
  recordsAndEdges,
} from '@cozemble/model-core'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'

export class InMemoryBackend implements Backend {
  constructor(
    private models: EventSourcedModel[] = [],
    private records: DataRecord[] = [],
    private readonly edges: TimestampedRecordGraphEdge[] = [],
    private readonly modelViews: ModelView[] = [],
    private attachments: UploadedAttachment[] = [],
  ) {}

  async saveNewGraph(graph: EventSourcedRecordGraph): Promise<Outcome<EventSourcedRecordGraph>> {
    graph.records.forEach((record) => this.saveNewRecord(record))
    graph.edges.forEach((edge) => this.edges.push(edge))
    return outcomeFns.successful(graph)
  }

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    if (this.models.some((m) => m.model.id.value === model.model.id.value)) {
      this.models = this.models.map((m) => (m.model.id.value === model.model.id.value ? model : m))
    } else {
      this.models.push(model)
    }
    return null
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    models.forEach((model) => this.saveModel(model))
    return null
  }

  _models(): Model[] {
    return Array.from(this.models.values()).map((m) => m.model)
  }

  async getRecords(modelId: ModelId, filterParams: FilterParams): Promise<EventSourcedRecordGraph> {
    const records = this.records.filter((r) => r.modelId.value === modelId.value)
    if (filterParams.search) {
      const filtered = records.filter((record) =>
        JSON.stringify(record.values)
          .toLowerCase()
          .includes((filterParams.search ?? '').toLowerCase()),
      )
      return eventSourcedRecordGraphFns.newInstance(
        filtered.map((r) => eventSourcedDataRecordFns.fromRecord(this._models(), r)),
        this.edges,
        [],
      )
    }
    return eventSourcedRecordGraphFns.newInstance(
      records.map((r) => eventSourcedDataRecordFns.fromRecord(this._models(), r)),
      this.edges,
      [],
    )
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    this.records.push(newRecord.record)
    return recordSaveSucceeded(newRecord.record)
  }

  async saveExistingRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    this.records = this.records.map((r) =>
      r.id.value === newRecord.record.id.value ? newRecord.record : r,
    )
    return recordSaveSucceeded(newRecord.record)
  }

  async searchRecords(modelId: ModelId, search: string): Promise<RecordsAndEdges> {
    const records = this.records.filter((r) => r.modelId.value === modelId.value)
    if (search.trim().length === 0) {
      return recordsAndEdges(
        records,
        this.edges.map((e) => e.edge),
      )
    }
    const matchingRecords = records.filter((record) =>
      JSON.stringify(record.values).includes(search),
    )
    const edges = new Set<RecordGraphEdge>()
    matchingRecords.forEach((record) => {
      const recordEdges = recordGraphEdgeFns.forRecord(
        this.edges.map((e) => e.edge),
        record.id,
      )
      recordEdges.forEach((edge) => edges.add(edge))
    })
    return recordsAndEdges(matchingRecords, Array.from(edges))
  }

  async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
    this.modelViews.push(modelView)
    return null
  }

  async recordById(modelId: ModelId, recordId: DataRecordId): Promise<RecordAndEdges | null> {
    const records = this.records.filter((r) => r.modelId.value === modelId.value)
    const record = records.find((record) => record.id.value === recordId.value) || null
    if (record === null) {
      return null
    }
    const edges = recordGraphEdgeFns.forRecord(
      this.edges.map((e) => e.edge),
      record.id,
    )
    return recordAndEdges(record, edges)
  }

  async uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    const uploadedAttachments: UploadedAttachment[] = files.map((file) => {
      return {
        _type: 'uploaded.attachment',
        attachmentId: uuids.v4(),
        file,
        size: null,
        thumbnailUrl: 'https://freesvg.org/img/ftthumbnail.png',
      }
    })
    this.attachments.push(...uploadedAttachments)
    progressUpdater(100)
    return uploadedAttachments
  }

  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    this.attachments = this.attachments.filter((ua) => !attachmentIds.includes(ua.attachmentId))
  }

  async getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
    return attachmentIds.map(
      (a) => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TEIDE.JPG/440px-TEIDE.JPG',
    )
  }
}
