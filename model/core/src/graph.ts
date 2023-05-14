import { Id, IdFns, TinyValue } from './tinyTypes'
import { Cardinality, DataRecordId, DottedIdPath, ModelId } from './core'

export interface ModelNode {
  _type: 'model.node'
  rootModelId: ModelId
  path: DottedIdPath | null
  cardinality: Cardinality
}

export interface ModelEdgeType extends TinyValue {
  _type: 'model.edge.type'
}

export const linkedRecordsEdgeType = { _type: 'model.edge.type', value: 'linked.records' }

export interface ModelEdge {
  _type: 'model.edge'
  id: Id
  from: ModelNode
  to: ModelNode
  edgeType: ModelEdgeType
}

export interface ModelGraph {
  _type: 'model.graph'
  nodes: ModelNode[]
  edges: ModelEdge[]
}

export const modelGraphFns = {
  newInstance: (nodes: ModelNode[], edges: ModelEdge[]): ModelGraph => ({
    _type: 'model.graph',
    nodes,
    edges,
  }),
  newModelNode: (
    rootModelId: ModelId,
    path: DottedIdPath | null,
    cardinality: Cardinality,
  ): ModelNode => ({
    _type: 'model.node',
    rootModelId,
    path,
    cardinality,
  }),
  newModelEdge: (from: ModelNode, to: ModelNode, edgeType: ModelEdgeType): ModelEdge => ({
    _type: 'model.edge',
    id: IdFns.newId(),
    from,
    to,
    edgeType,
  }),
}

export interface DataRecordEdge {
  _type: 'data.record.edge'
  id: Id
  modelEdgeId: Id
  from: DataRecordId[]
  to: DataRecordId[]
}

export const dataRecordEdgeFns = {
  newInstance: (modelEdgeId: Id, from: DataRecordId[], to: DataRecordId[]): DataRecordEdge => ({
    _type: 'data.record.edge',
    id: IdFns.newId(),
    modelEdgeId,
    from,
    to,
  }),
}
