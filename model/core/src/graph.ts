import { DataRecord, DataRecordId, ModelReferenceId } from './core'
import { Id, tinyValueFns } from './TinyValue'

export interface RecordGraphEdge {
  _type: 'record.graph.edge'
  id: Id
  modelReferenceId: ModelReferenceId
  fromRecordId: DataRecordId
  toRecordId: DataRecordId
}

export const recordGraphEdgeFns = {
  newInstance: (
    modelReferenceId: ModelReferenceId,
    fromRecordId: DataRecordId,
    toRecordId: DataRecordId,
    id: Id = tinyValueFns.id(),
  ): RecordGraphEdge => ({
    _type: 'record.graph.edge',
    id,
    modelReferenceId,
    fromRecordId,
    toRecordId,
  }),
  forModelReference(
    edges: RecordGraphEdge[],
    modelReferenceId: ModelReferenceId,
  ): RecordGraphEdge[] {
    return edges.filter((edge) => edge.modelReferenceId.value === modelReferenceId.value)
  },
  forRecord(edges: RecordGraphEdge[], recordId: DataRecordId): RecordGraphEdge[] {
    return edges.filter(
      (edge) =>
        edge.fromRecordId.value === recordId.value || edge.toRecordId.value === recordId.value,
    )
  },
}

export interface RecordGraph {
  _type: 'record.graph'
  records: DataRecord[]
  edges: RecordGraphEdge[]
  relatedRecords: DataRecord[]
}

export const recordGraphFns = {
  newInstance: (
    records: DataRecord[] = [],
    edges: RecordGraphEdge[],
    relatedRecords: DataRecord[] = [],
  ): RecordGraph => ({
    _type: 'record.graph',
    records,
    edges,
    relatedRecords,
  }),
  appendRecord: (graph: RecordGraph, record: DataRecord): RecordGraph => {
    return {
      ...graph,
      records: [...graph.records, record],
    }
  },
}
