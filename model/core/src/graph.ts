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

export interface RecordGraphNode {
  _type: 'record.graph.node'
  record: DataRecord
  edges: RecordGraphEdge[]
}

export const recordGraphNodeFns = {
  newInstance: (record: DataRecord, edges: RecordGraphEdge[]): RecordGraphNode => ({
    _type: 'record.graph.node',
    record,
    edges,
  }),
}

export interface RecordGraph {
  _type: 'record.graph'
  nodes: RecordGraphNode[]
  relatedRecords: DataRecord[]
}

export const recordGraphFns = {
  newInstance: (nodes: RecordGraphNode[] = [], relatedRecords: DataRecord[] = []): RecordGraph => ({
    _type: 'record.graph',
    nodes,
    relatedRecords,
  }),
  appendRecord: (graph: RecordGraph, record: RecordGraphNode | DataRecord): RecordGraph => {
    const newNode =
      record._type === 'record.graph.node' ? record : recordGraphNodeFns.newInstance(record, [])
    return {
      ...graph,
      nodes: [...graph.nodes, newNode],
    }
  },
}
