import { DataRecord, DataRecordId, ModelReferenceId } from './core'
import { Id, tinyValueFns } from './TinyValue'

export interface DataRecordEdge {
  _type: 'data.record.edge'
  id: Id
  modelReferenceId: ModelReferenceId
  fromRecordId: DataRecordId
  toRecordId: DataRecordId
}

export const dataRecordEdgeFns = {
  newInstance: (
    modelReferenceId: ModelReferenceId,
    fromRecordId: DataRecordId,
    toRecordId: DataRecordId,
    id: Id = tinyValueFns.id(),
  ): DataRecordEdge => ({
    _type: 'data.record.edge',
    id,
    modelReferenceId,
    fromRecordId,
    toRecordId,
  }),
  forModelReference(edges: DataRecordEdge[], modelReferenceId: ModelReferenceId): DataRecordEdge[] {
    return edges.filter((edge) => edge.modelReferenceId.value === modelReferenceId.value)
  },
  forRecord(edges: DataRecordEdge[], recordId: DataRecordId): DataRecordEdge[] {
    return edges.filter(
      (edge) =>
        edge.fromRecordId.value === recordId.value || edge.toRecordId.value === recordId.value,
    )
  },
}

export interface DataNode {
  _type: 'data.node'
  record: DataRecord
  edges: DataRecordEdge[]
  relatedRecords: DataRecord[]
}

export const dataNodeFns = {
  newInstance: (
    record: DataRecord,
    edges: DataRecordEdge[],
    relatedRecords: DataRecord[],
  ): DataNode => ({
    _type: 'data.node',
    record,
    edges,
    relatedRecords,
  }),
}
