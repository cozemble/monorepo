import type {
  EventSourcedDataRecord,
  EventSourcedModel,
  EventSourcedRecordGraph,
} from '@cozemble/model-event-sourced'
import type { JustErrorMessage, Outcome } from '@cozemble/lang-util'
import type {
  DataRecordId,
  Id,
  ModelId,
  ModelView,
  RecordAndEdges,
  RecordGraphEdge,
  RecordsAndEdges,
} from '@cozemble/model-core'
import type { AttachmentsManager, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { FilterGroupList } from '@cozemble/data-filters-core'
import { filterGroupListFns } from '@cozemble/data-filters-core'

export interface FilterParams {
  search: string | null
  filters: FilterGroupList
}

export function emptyFilterParams(): FilterParams {
  return { search: null, filters: filterGroupListFns.empty() }
}

export interface RecordSaver {
  saveNewRecord(
    newRecord: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome>

  saveExistingRecord(
    record: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome>
}

export interface Backend extends AttachmentsManager, RecordSaver {
  saveNewGraph(graph: EventSourcedRecordGraph): Promise<Outcome<EventSourcedRecordGraph>>

  saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null>

  getRecords(modelId: ModelId, filterParams: FilterParams): Promise<EventSourcedRecordGraph>

  searchRecords(modelId: ModelId, search: string): Promise<RecordsAndEdges>

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<RecordAndEdges | null>

  saveModelView(modelView: ModelView): Promise<JustErrorMessage | null>
}

export const notImplementedBackend: Backend = {
  async saveNewGraph() {
    throw new Error('Not implemented')
  },

  saveNewRecord() {
    throw new Error('Not implemented')
  },
  saveExistingRecord() {
    throw new Error('Not implemented')
  },
  saveModel: async () => {
    throw new Error('Not implemented')
  },
  saveModels: async () => {
    throw new Error('Not implemented')
  },
  getRecords: async () => {
    throw new Error('Not implemented')
  },
  recordById: async () => {
    throw new Error('Not implemented')
  },
  async searchRecords() {
    throw new Error('Not implemented')
  },
  async saveModelView() {
    throw new Error('Not implemented')
  },
  async uploadAttachments() {
    throw new Error('Not implemented')
  },

  async deleteAttachments() {
    throw new Error('Not implemented')
  },

  async getAttachmentViewUrls() {
    throw new Error('Not implemented')
  },
}
