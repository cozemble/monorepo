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
} from '@cozemble/model-core'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'
import { recordsAndEdges } from '@cozemble/model-core/dist/esm'

export class InMemoryBackend implements Backend {
  constructor(
    private readonly models: Map<string, EventSourcedModel> = new Map(),
    private readonly records: Map<string, DataRecord[]> = new Map(),
    private readonly edges: RecordGraphEdge[] = [],
    private readonly modelViews: ModelView[] = [],
    private attachments: UploadedAttachment[] = [],
  ) {}

  async saveNewGraph(graph: EventSourcedRecordGraph): Promise<Outcome<EventSourcedRecordGraph>> {
    graph.records.forEach((record) => this.saveNewRecord(record))
    graph.edges.forEach((edge) => this.edges.push(edge))
    return outcomeFns.successful(graph)
  }

  async saveNewEdges(edges: RecordGraphEdge[]): Promise<Outcome<RecordGraphEdge[]>> {
    edges.forEach((edge) => this.edges.push(edge))
    return outcomeFns.successful(edges)
  }

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    this.models.set(model.model.id.value, model)
    return null
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    models.forEach((model) => this.models.set(model.model.id.value, model))
    return null
  }

  _models(): Model[] {
    return Array.from(this.models.values()).map((m) => m.model)
  }

  async getRecords(modelId: ModelId, filterParams: FilterParams): Promise<EventSourcedRecordGraph> {
    const records = this.records.get(modelId.value) ?? []
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
    const existingRecords = this.records.get(newRecord.record.modelId.value) || []
    const updatedRecords = [...existingRecords, newRecord.record]
    this.records.set(newRecord.record.modelId.value, updatedRecords)
    return recordSaveSucceeded(newRecord.record)
  }

  async saveExistingRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const existingRecords = this.records.get(newRecord.record.modelId.value) || []
    const updatedRecords = existingRecords.map((record) => {
      if (record.id.value === newRecord.record.id.value) {
        return newRecord.record
      }
      return record
    })
    this.records.set(newRecord.record.modelId.value, updatedRecords)
    return recordSaveSucceeded(newRecord.record)
  }

  async searchRecords(modelId: ModelId, search: string): Promise<RecordsAndEdges> {
    const records = this.records.get(modelId.value) || []
    if (search.trim().length === 0) {
      return recordsAndEdges(records, this.edges)
    }
    const matchingRecords = records.filter((record) =>
      JSON.stringify(record.values).includes(search),
    )
    const edges = new Set<RecordGraphEdge>()
    matchingRecords.forEach((record) => {
      const recordEdges = recordGraphEdgeFns.forRecord(this.edges, record.id)
      recordEdges.forEach((edge) => edges.add(edge))
    })
    return recordsAndEdges(matchingRecords, Array.from(edges))
  }

  async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
    this.modelViews.push(modelView)
    return null
  }

  async recordById(modelId: ModelId, recordId: DataRecordId): Promise<RecordAndEdges | null> {
    const records = this.records.get(modelId.value) || []
    const record = records.find((record) => record.id.value === recordId.value) || null
    if (record === null) {
      return null
    }
    const edges = recordGraphEdgeFns.forRecord(this.edges, record.id)
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
