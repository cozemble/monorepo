import { DataRecord, DataRecordId, ModelId, ModelReferenceId } from './core'
import { Id, tinyValueFns } from './TinyValue'
import { Option } from '@cozemble/lang-util'

export interface RecordGraphEdge {
  _type: 'record.graph.edge'
  id: Id
  modelReferenceId: ModelReferenceId
  originModelId: ModelId
  referenceModelId: ModelId
  originRecordId: DataRecordId
  referenceRecordId: DataRecordId
}

export const recordGraphEdgeFns = {
  newInstance: (
    modelReferenceId: ModelReferenceId,
    originModelId: ModelId,
    referenceModelId: ModelId,
    originRecordId: DataRecordId,
    referenceRecordId: DataRecordId,
    id: Id = tinyValueFns.id(),
  ): RecordGraphEdge => ({
    _type: 'record.graph.edge',
    id,
    modelReferenceId,
    originModelId,
    referenceModelId,
    originRecordId,
    referenceRecordId,
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
        edge.originRecordId.value === recordId.value ||
        edge.referenceRecordId.value === recordId.value,
    )
  },
}

export interface RecordGraph {
  _type: 'record.graph'
  records: DataRecord[]
  edges: RecordGraphEdge[]
  relatedRecords: DataRecord[]
}

export type RecordGraphOption = Option<RecordGraph>

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
