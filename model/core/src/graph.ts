import { DataRecord, DataRecordId, ModelId, ModelReference, ModelReferenceId } from './core'
import { Id, tinyValueFns } from './TinyValue'
import { Option } from '@cozemble/lang-util'

type Option = typeof Option

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
  forRecords(edges: RecordGraphEdge[], recordIds: DataRecordId[]): RecordGraphEdge[] {
    return edges.filter(
      (edge) =>
        recordIds.includes(edge.originRecordId) || recordIds.includes(edge.referenceRecordId),
    )
  },
  involvesRecord(edges: RecordGraphEdge, recordId: DataRecordId): boolean {
    return (
      edges.originRecordId.value === recordId.value ||
      edges.referenceRecordId.value === recordId.value
    )
  },
  sameReference(a: RecordGraphEdge, b: RecordGraphEdge): boolean {
    return (
      a.modelReferenceId.value === b.modelReferenceId.value &&
      a.originModelId.value === b.originModelId.value &&
      a.referenceModelId.value === b.referenceModelId.value &&
      a.originRecordId.value === b.originRecordId.value &&
      a.referenceRecordId.value === b.referenceRecordId.value
    )
  },
  setReferencedRecordId(modelReference: ModelReference, edge: RecordGraphEdge): RecordGraphEdge {
    if (modelReference.inverse) {
      return {
        ...edge,
        originRecordId: edge.referenceRecordId,
      }
    }
    return {
      ...edge,
      referenceRecordId: edge.originRecordId,
    }
  },
  getReferencedRecordId(modelReference: ModelReference, edge: RecordGraphEdge): DataRecordId {
    if (modelReference.inverse) {
      return edge.originRecordId
    }
    return edge.referenceRecordId
  },
  proposeEdge(
    modelReference: ModelReference,
    existingEdges: RecordGraphEdge[],
    proposed: RecordGraphEdge,
  ): { proposed: RecordGraphEdge; accepted: RecordGraphEdge } {
    if (modelReference.referencedCardinality === 'one') {
      const existing = existingEdges.find(
        (edge) =>
          edge.referenceRecordId.value === proposed.referenceRecordId.value &&
          edge.modelReferenceId.value === proposed.modelReferenceId.value,
      )
      if (existing && existing.originRecordId.value !== proposed.originRecordId.value) {
        const accepted = { ...existing, originRecordId: proposed.originRecordId }
        return { proposed, accepted }
      }
    }
    if (modelReference.originCardinality === 'one') {
      const existing = existingEdges.find(
        (edge) =>
          edge.originRecordId.value === proposed.originRecordId.value &&
          edge.modelReferenceId.value === proposed.modelReferenceId.value,
      )
      if (existing && existing.referenceRecordId.value !== proposed.referenceRecordId.value) {
        const accepted = { ...existing, referenceRecordId: proposed.referenceRecordId }
        return { proposed, accepted }
      }
    }
    return { proposed, accepted: proposed }
  },
}

export interface RecordGraph {
  _type: 'record.graph'
  records: DataRecord[]
  edges: RecordGraphEdge[]
  relatedRecords: DataRecord[]
}

// @ts-ignore
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

export interface RecordAndEdges {
  _type: 'record.and.edges'
  record: DataRecord
  edges: RecordGraphEdge[]
}

export function recordAndEdges(record: DataRecord, edges: RecordGraphEdge[]): RecordAndEdges {
  return {
    _type: 'record.and.edges',
    record,
    edges,
  }
}

export interface RecordsAndEdges {
  _type: 'records.and.edges'
  records: DataRecord[]
  edges: RecordGraphEdge[]
}

export function recordsAndEdges(records: DataRecord[], edges: RecordGraphEdge[]): RecordsAndEdges {
  return {
    _type: 'records.and.edges',
    records,
    edges,
  }
}
