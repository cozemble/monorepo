import { Id, RecordGraphEdge } from '@cozemble/model-core'
import { DataRecord } from '@cozemble/model-core'

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
