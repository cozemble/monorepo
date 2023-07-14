import {
  DataRecord,
  DataRecordId,
  Id,
  Model,
  ModelReference,
  modelReferenceFns,
  RecordGraph,
  RecordGraphEdge,
  recordGraphEdgeFns,
  SystemConfiguration,
  TimestampEpochMillis,
  timestampEpochMillis,
} from '@cozemble/model-core'
import { DataRecordEditEvent } from './dataRecordEditEvents.js'
import { EventSourcedDataRecord, eventSourcedDataRecordFns } from './EventSourcedDataRecord.js'
import { RecordGraphEvent, RecordReferencesChangedEvent } from './recordGraphEvents.js'
import { mandatory } from '@cozemble/lang-util'

export interface TimestampedRecordGraphEdge {
  _type: 'timestamped.record.graph.edge'
  edge: RecordGraphEdge
  timestamp: TimestampEpochMillis
}

export const timestampedRecordGraphEdgeFns = {
  newInstance: (
    edge: RecordGraphEdge,
    timestamp = timestampEpochMillis(),
  ): TimestampedRecordGraphEdge => ({
    _type: 'timestamped.record.graph.edge',
    edge,
    timestamp,
  }),
}

export interface EventSourcedRecordGraph {
  _type: 'event.sourced.record.graph'
  records: EventSourcedDataRecord[]
  edges: TimestampedRecordGraphEdge[]
  deletedEdges: TimestampedRecordGraphEdge[]
  relatedRecords: DataRecord[]
  events: RecordGraphEvent[]
}

function updateEdge(
  edge: TimestampedRecordGraphEdge,
  event: RecordReferencesChangedEvent,
): TimestampedRecordGraphEdge {
  if (event.modelReference.originModelId.value === edge.edge.originModelId.value) {
    return {
      ...edge,
      edge: { ...edge.edge, originRecordId: event.selectedRecordIds[0] },
      timestamp: event.timestamp,
    }
  } else {
    return {
      ...edge,
      edge: { ...edge.edge, referenceRecordId: event.selectedRecordIds[0] },
      timestamp: event.timestamp,
    }
  }
}

function makeNewEdge(
  event: RecordReferencesChangedEvent,
  selectedRecordId: DataRecordId,
): TimestampedRecordGraphEdge {
  const originRecordId =
    event.modelReference.originModelId.value === event.recordBeingEdited.modelId.value
      ? event.recordBeingEdited.id
      : selectedRecordId
  const referenceRecordId =
    event.modelReference.originModelId.value === event.recordBeingEdited.modelId.value
      ? selectedRecordId
      : event.recordBeingEdited.id
  return timestampedRecordGraphEdgeFns.newInstance(
    recordGraphEdgeFns.newInstance(
      event.modelReference.id,
      event.modelReference.originModelId,
      mandatory(
        event.modelReference.referencedModelIds[0],
        `No referenced model id found for ${event.modelReference.id.value}`,
      ),
      originRecordId,
      referenceRecordId,
    ),
    event.timestamp,
  )

  // if (event.modelReference.originModelId.value === event.recordBeingEdited.modelId.value) {
  //   return timestampedRecordGraphEdgeFns.newInstance(
  //     recordGraphEdgeFns.newInstance(
  //       event.modelReference.id,
  //       event.modelReference.originModelId,
  //       mandatory(
  //         event.modelReference.referencedModelIds[0],
  //         `No referenced model id found for ${event.modelReference.id.value}`,
  //       ),
  //       event.recordBeingEdited.id,
  //       selectedRecordId,
  //     ),
  //     event.timestamp,
  //   )
  // }
  // return timestampedRecordGraphEdgeFns.newInstance(
  //   recordGraphEdgeFns.newInstance(
  //     event.modelReference.id,
  //     mandatory(
  //       event.modelReference.referencedModelIds[0],
  //       `No referenced model id found for ${event.modelReference.id.value}`,
  //     ),
  //     event.recordBeingEdited.modelId,
  //     selectedRecordId,
  //     event.recordBeingEdited.id,
  //   ),
  //   event.timestamp,
  // )
}

function deleteEdges(
  graph: EventSourcedRecordGraph,
  existingEdges: TimestampedRecordGraphEdge[],
  event: RecordReferencesChangedEvent,
) {
  return {
    ...graph,
    edges: graph.edges.filter((edge) => !existingEdges.includes(edge)),
    deletedEdges: [
      ...graph.deletedEdges,
      ...existingEdges.map((e) =>
        timestampedRecordGraphEdgeFns.newInstance(e.edge, event.timestamp),
      ),
    ],
  }
}

function handleHasOneReference(
  event: RecordReferencesChangedEvent,
  existingEdges: TimestampedRecordGraphEdge[],
  graph: EventSourcedRecordGraph,
) {
  if (event.selectedRecordIds.length > 1) {
    throw new Error(
      `Cannot set multiple references for has-one relationship ${event.modelReference.id.value}`,
    )
  }
  if (existingEdges.length > 1) {
    throw new Error(
      `Found ${existingEdges.length} edges for model reference ${event.modelReference.id.value} but expected 1`,
    )
  }
  if (existingEdges.length === 1) {
    const updatedEdge = updateEdge(existingEdges[0], event)
    return {
      ...graph,
      edges: graph.edges.map((edge) => (edge === existingEdges[0] ? updatedEdge : edge)),
    }
  }
  const newEdge = makeNewEdge(event, event.selectedRecordIds[0])
  return { ...graph, edges: [...graph.edges, newEdge] }
}

function findDeletedEdges(
  existingEdges: TimestampedRecordGraphEdge[],
  desiredEdgeState: TimestampedRecordGraphEdge[],
) {
  return existingEdges.filter(
    (existingEdge) =>
      !desiredEdgeState.some((edge) =>
        recordGraphEdgeFns.sameReference(existingEdge.edge, edge.edge),
      ),
  )
}

function findRetainedEdges(
  existingEdges: TimestampedRecordGraphEdge[],
  desiredEdgeState: TimestampedRecordGraphEdge[],
) {
  return existingEdges.filter((existingEdge) =>
    desiredEdgeState.some((edge) => recordGraphEdgeFns.sameReference(existingEdge.edge, edge.edge)),
  )
}

function findNewEdges(
  deletedEdges: TimestampedRecordGraphEdge[],
  retainedEdges: TimestampedRecordGraphEdge[],
  changedEdges: TimestampedRecordGraphEdge[],
  desiredEdgeState: TimestampedRecordGraphEdge[],
): TimestampedRecordGraphEdge[] {
  return desiredEdgeState.filter(
    (desiredEdge) =>
      !deletedEdges.some((edge) => recordGraphEdgeFns.sameReference(desiredEdge.edge, edge.edge)) &&
      !changedEdges.some((edge) => recordGraphEdgeFns.sameReference(desiredEdge.edge, edge.edge)) &&
      !retainedEdges.some((edge) => recordGraphEdgeFns.sameReference(desiredEdge.edge, edge.edge)),
  )
}

function findChangedEdges(
  graph: EventSourcedRecordGraph,
  desiredEdgeState: TimestampedRecordGraphEdge[],
  event: RecordReferencesChangedEvent,
): TimestampedRecordGraphEdge[] {
  const edges = graph.edges.map((edge) => edge.edge)
  return desiredEdgeState.flatMap((desiredEdge) => {
    const { proposed, accepted } = recordGraphEdgeFns.proposeEdge(
      event.modelReference,
      edges,
      desiredEdge.edge,
    )
    if (accepted !== proposed) {
      const existingEdge = mandatory(
        graph.edges.find((edge) => edge.edge.id.value === accepted.id.value),
        `Could not find edge ${accepted.id.value} in graph`,
      )
      return [{ ...existingEdge, edge: accepted, timestamp: event.timestamp }]
    }
    return []
  })
}

function handleHasManyReference(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
  existingEdges: TimestampedRecordGraphEdge[],
): EventSourcedRecordGraph {
  const desiredEdgeState = event.selectedRecordIds.map((id) => makeNewEdge(event, id))
  const deletedEdges = findDeletedEdges(existingEdges, desiredEdgeState).map((edge) => ({
    ...edge,
    timestamp: event.timestamp,
  }))
  const retainedEdges = findRetainedEdges(existingEdges, desiredEdgeState)
  const changedEdges = findChangedEdges(graph, desiredEdgeState, event)
  const newEdges = findNewEdges(deletedEdges, retainedEdges, changedEdges, desiredEdgeState)
  const unrelatedEdges = graph.edges.filter(
    (edge) =>
      edge.edge.modelReferenceId.value !== event.modelReference.id.value ||
      !(
        recordGraphEdgeFns.involvesRecord(edge.edge, event.recordBeingEdited.id) ||
        changedEdges.some((c) => c.edge.id.value === edge.edge.id.value)
      ),
  )

  return {
    ...graph,
    edges: [...unrelatedEdges, ...retainedEdges, ...changedEdges, ...newEdges],
    deletedEdges: [...graph.deletedEdges, ...deletedEdges],
  }
}

function handleRecordReferencedChanged(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
): EventSourcedRecordGraph {
  const existingEdges = graph.edges.filter(
    (edge) =>
      edge.edge.modelReferenceId.value === event.modelReference.id.value &&
      recordGraphEdgeFns.involvesRecord(edge.edge, event.recordBeingEdited.id),
  )
  if (event.selectedRecordIds.length === 0) {
    return deleteEdges(graph, existingEdges, event)
  }
  if (modelReferenceFns.getCardinality(event.modelReference) === 'one') {
    return handleHasOneReference(event, existingEdges, graph)
  }
  return handleHasManyReference(graph, event, existingEdges)
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

function storeEvent(
  eventSourcedRecordGraph: EventSourcedRecordGraph,
  event: RecordGraphEvent,
): EventSourcedRecordGraph {
  return { ...eventSourcedRecordGraph, events: [...eventSourcedRecordGraph.events, event] }
}

export const eventSourcedRecordGraphFns = {
  newInstance: (
    records: EventSourcedDataRecord[],
    edges: TimestampedRecordGraphEdge[],
    relatedRecords: DataRecord[],
    events: RecordGraphEvent[] = [],
  ): EventSourcedRecordGraph => ({
    _type: 'event.sourced.record.graph',
    records,
    edges,
    relatedRecords,
    events,
    deletedEdges: [],
  }),
  fromRecordGraph: (models: Model[], graph: RecordGraph): EventSourcedRecordGraph => {
    return eventSourcedRecordGraphFns.newInstance(
      graph.records.map((record) => eventSourcedDataRecordFns.fromRecord(models, record)),
      graph.edges.map((edge) => timestampedRecordGraphEdgeFns.newInstance(edge)),
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
        edge.edge.modelReferenceId.value === modelReference.id.value &&
        recordIdMatches(modelReference, edge.edge, recordId),
    )
    return edges.flatMap((e) =>
      [e.edge.originRecordId, e.edge.referenceRecordId].filter((id) => id.value !== recordId.value),
    )
  },
  addEvent(graph: EventSourcedRecordGraph, event: RecordGraphEvent): EventSourcedRecordGraph {
    if (event._type === 'record.references.changed.event') {
      return storeEvent(handleRecordReferencedChanged(graph, event), event)
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
    return graph.edges
      .filter(
        (edge) =>
          edge.edge.originRecordId.value === recordId.value ||
          edge.edge.referenceRecordId.value === recordId.value,
      )
      .map((e) => e.edge)
  },
  recordsChangedSince(
    graph: EventSourcedRecordGraph,
    sinceByRecordId: Map<string, number>,
  ): EventSourcedDataRecord[] {
    return graph.records.filter((record) => {
      const since = sinceByRecordId.get(record.record.id.value) ?? 0
      return (
        record.events.some((event) => event.timestamp.value > since) ||
        graph.events.some(
          (e) =>
            e.recordBeingEdited.id.value === record.record.id.value && e.timestamp.value > since,
        )
      )
    })
  },
  merge: (
    graph: EventSourcedRecordGraph,
    other: EventSourcedRecordGraph,
  ): EventSourcedRecordGraph => {
    return {
      ...graph,
      records: [...graph.records, ...other.records],
      edges: [...graph.edges, ...other.edges],
      relatedRecords: [...graph.relatedRecords, ...other.relatedRecords],
      events: [...graph.events, ...other.events],
    }
  },
  empty: (): EventSourcedRecordGraph => ({
    _type: 'event.sourced.record.graph',
    records: [],
    edges: [],
    relatedRecords: [],
    events: [],
    deletedEdges: [],
  }),
  removeEdge(graph: EventSourcedRecordGraph, edgeId: Id): EventSourcedRecordGraph {
    return {
      ...graph,
      edges: graph.edges.filter((edge) => edge.edge.id.value !== edgeId.value),
    }
  },
}
