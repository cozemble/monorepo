import { Id, RecordGraphEdge } from '@cozemble/model-core'

export type JsonPath = string[]

export interface SavableRecord {
  id: { value: string }
  modelId: { value: string }
  values: { [key: string]: any }
}

export interface SavableRecords {
  _type: 'savable.records'
  uniquePaths: JsonPath[]
  records: SavableRecord[]
  edges: RecordGraphEdge[]
  deletedEdges: Id[]
}

export function savableRecords(
  records: SavableRecord[],
  edges: RecordGraphEdge[],
  deletedEdges: Id[],
  uniquePaths: JsonPath[] = [],
): SavableRecords {
  return {
    _type: 'savable.records',
    uniquePaths,
    records,
    edges,
    deletedEdges,
  }
}
