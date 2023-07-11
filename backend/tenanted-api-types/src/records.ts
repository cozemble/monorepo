import { DataRecord, Id, RecordGraphEdge } from '@cozemble/model-core'

export type JsonPath = string[]

export interface SavableRecord {
  id: { value: string }
  modelId: { value: string }
  values: { [key: string]: any }
}

export interface SavableRecords {
  _type: 'savable.records'
  records: SavableRecord[]
  edges: RecordGraphEdge[]
  deletedEdges: Id[]
}

export function savableRecords(
  records: SavableRecord[],
  edges: RecordGraphEdge[],
  deletedEdges: Id[],
): SavableRecords {
  return {
    _type: 'savable.records',
    records,
    edges,
    deletedEdges,
  }
}

export interface FetchedRecords {
  _type: 'fetched.records'
  records: DataRecord[]
  edges: RecordGraphEdge[]
  queryCount: number
  queryPages: number
  totalCount: number
  totalPages: number
}

export function fetchedRecords(
  records: DataRecord[],
  edges: RecordGraphEdge[],
  queryCount: number,
  queryPages: number,
  totalCount: number,
  totalPages: number,
): FetchedRecords {
  return {
    _type: 'fetched.records',
    records,
    edges,
    queryCount,
    queryPages,
    totalCount,
    totalPages,
  }
}

export interface SuccessfulSaveResponse {
  _type: 'success'
  edgesResult: {
    _type: 'success'
    updatedCount: number
    insertedCount: number
  }
  recordResult: {
    _type: 'success'
    updatedRecords: DataRecord[]
    insertedRecords: DataRecord[]
  }
  deletedEdgesResult: {
    edge_ids: string[]
  }
}

const sampleSaveResponse: SuccessfulSaveResponse = {
  _type: 'success',
  edgesResult: {
    _type: 'success',
    updatedCount: 0,
    insertedCount: 0,
  },
  recordResult: {
    _type: 'success',
    updatedRecords: [],
    insertedRecords: [
      {
        id: {
          _type: 'data.record.id',
          value: '6e93b822-c2cc-4750-a0b5-19471bbd7f97',
        },
        _type: 'data.record',
        seqId: 4,
        values: {
          'feab22aa-61ac-4493-afb0-9779e5cdc92e': 'Tom',
        },
        modelId: {
          _type: 'model.id',
          value: '173e6dfc-8c2e-488e-8ffc-093adf112e08',
        },
        createdBy: {
          _type: 'user.id',
          value: 'test',
        },
        createdMillis: {
          _type: 'timestamp.epoch.millis',
          value: 1689062705480,
        },
        updatedMillis: {
          _type: 'timestamp.epoch.millis',
          value: 1689062705480,
        },
      },
    ],
  },
  deletedEdgesResult: {
    edge_ids: [],
  },
}
