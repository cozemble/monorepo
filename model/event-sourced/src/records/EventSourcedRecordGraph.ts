import {
  DataRecord,
  DataRecordId,
  Model,
  ModelReference,
  RecordGraph,
  RecordGraphEdge,
  recordGraphEdgeFns,
  SystemConfiguration,
} from '@cozemble/model-core'
import { DataRecordEditEvent } from './dataRecordEditEvents'
import { EventSourcedDataRecord, eventSourcedDataRecordFns } from './EventSourcedDataRecord'
import { RecordGraphEvent, RecordReferencesChangedEvent } from './recordGraphEvents'

export interface EventSourcedRecordGraph {
  _type: 'event.sourced.record.graph'
  records: EventSourcedDataRecord[]
  edges: RecordGraphEdge[]
  relatedRecords: DataRecord[]
}

function addReferencesChangedEventForward(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
): EventSourcedRecordGraph {
  const relevantEdges = graph.edges.filter(
    (edge) =>
      edge.modelReferenceId.value === event.modelReference.id.value &&
      edge.originRecordId.value === event.recordBeingEdited.id.value,
  )
  const newEdges = event.selection.map((selectedRecord) => {
    return recordGraphEdgeFns.newInstance(
      event.modelReference.id,
      event.modelReference.originModelId,
      selectedRecord.modelId,
      event.recordBeingEdited.id,
      selectedRecord.id,
    )
  })
  const retainedEdges = graph.edges.filter((edge) => !relevantEdges.includes(edge))
  return { ...graph, edges: [...retainedEdges, ...newEdges] }
}

function addReferencesChangedEventInverse(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
): EventSourcedRecordGraph {
  const relevantEdges = graph.edges.filter(
    (edge) =>
      edge.modelReferenceId.value === event.modelReference.id.value &&
      edge.referenceRecordId.value === event.recordBeingEdited.id.value,
  )
  const newEdges = event.selection.map((selectedRecord) => {
    return recordGraphEdgeFns.newInstance(
      event.modelReference.id,
      selectedRecord.modelId,
      event.recordBeingEdited.modelId,
      selectedRecord.id,
      event.recordBeingEdited.id,
    )
  })
  const retainedEdges = graph.edges.filter((edge) => !relevantEdges.includes(edge))
  return { ...graph, edges: [...retainedEdges, ...newEdges] }
}

function addReferencesChangedEvent(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
): EventSourcedRecordGraph {
  if (event.modelReference.cardinality === 'one' && event.selection.length > 1) {
    throw new Error(`Cannot add multiple references to a one to one relationship`)
  }
  if (event.modelReference.inverse) {
    return addReferencesChangedEventInverse(graph, event)
  } else {
    return addReferencesChangedEventForward(graph, event)
  }
}

function recordIdMatches(
  modelReference: ModelReference,
  edge: RecordGraphEdge,
  recordId: DataRecordId,
) {
  return (
    edge.referenceRecordId.value === recordId.value || edge.originRecordId.value === recordId.value
  )
}

export const eventSourcedRecordGraphFns = {
  newInstance: (
    records: EventSourcedDataRecord[],
    edges: RecordGraphEdge[],
    relatedRecords: DataRecord[],
  ): EventSourcedRecordGraph => ({
    _type: 'event.sourced.record.graph',
    records,
    edges,
    relatedRecords,
  }),
  fromRecordGraph: (models: Model[], graph: RecordGraph): EventSourcedRecordGraph => {
    return eventSourcedRecordGraphFns.newInstance(
      graph.records.map((record) => eventSourcedDataRecordFns.fromRecord(models, record)),
      graph.edges,
      graph.relatedRecords,
    )
  },
  appendRecord: (
    graph: EventSourcedRecordGraph,
    record: EventSourcedDataRecord,
  ): EventSourcedRecordGraph => {
    return {
      ...graph,
      records: [...graph.records, record],
    }
  },
  addRecordEditEvent: (
    systemConfiguration: SystemConfiguration,
    graph: EventSourcedRecordGraph,
    recordId: DataRecordId,
    event: DataRecordEditEvent,
  ): EventSourcedRecordGraph => {
    const record = graph.records.find((r) => r.record.id.value === recordId.value)
    if (!record) {
      throw new Error('Record not found: ' + recordId)
    }
    const mutatedRecord = eventSourcedDataRecordFns.addEvent(systemConfiguration, event, record)
    return {
      ...graph,
      records: graph.records.map((r) => (r.record.id.value === recordId.value ? mutatedRecord : r)),
    }
  },
  updateModelsInDataRecords: (
    graph: EventSourcedRecordGraph,
    models: Model[],
  ): EventSourcedRecordGraph => {
    return {
      ...graph,
      records: graph.records.map((r) => eventSourcedDataRecordFns.updateModels(models, r)),
    }
  },
  getRecords: (graph: EventSourcedRecordGraph): EventSourcedDataRecord[] => {
    return graph.records
  },
  recordWithId(graph: EventSourcedRecordGraph, recordId: DataRecordId): EventSourcedDataRecord {
    const record = graph.records.find((r) => r.record.id.value === recordId.value)
    if (!record) {
      throw new Error('Record not found: ' + recordId)
    }
    return record
  },
  referencedRecordIds: (
    graph: EventSourcedRecordGraph,
    recordId: DataRecordId,
    modelReference: ModelReference,
  ): DataRecordId[] => {
    const edges = graph.edges.filter(
      (edge) =>
        edge.modelReferenceId.value === modelReference.id.value &&
        recordIdMatches(modelReference, edge, recordId),
    )
    return edges.flatMap((e) =>
      [e.originRecordId, e.referenceRecordId].filter((id) => id.value !== recordId.value),
    )
  },
  addEvent(graph: EventSourcedRecordGraph, event: RecordGraphEvent): EventSourcedRecordGraph {
    if (event._type === 'record.references.changed.event') {
      return addReferencesChangedEvent(graph, event)
    }
    return graph
  },
  addEvents(
    graph: EventSourcedRecordGraph,
    ...events: RecordGraphEvent[]
  ): EventSourcedRecordGraph {
    return events.reduce((g, event) => this.addEvent(g, event), graph)
  },
  getEdgesInvolvingRecord(
    graph: EventSourcedRecordGraph,
    recordId: DataRecordId,
  ): RecordGraphEdge[] {
    return graph.edges.filter(
      (edge) =>
        edge.originRecordId.value === recordId.value ||
        edge.referenceRecordId.value === recordId.value,
    )
  },
}
