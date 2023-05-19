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

// function updateFromInEditedRecord(
//   node: EventSourcedDataRecord, // any record type, customer, booking, invoice
//   event: RecordReferencesChangedEvent, // setting the customer field of a booking: from booking to customer
// ): RecordGraphEdge[] {
//   if (node.record.record.id.value !== event.recordBeingEdited.id.value) {
//     return node.edges
//   }
//   const newFromEdges = event.selection.map((selectedRecord) => {
//     return recordGraphEdgeFns.newInstance(
//       event.modelReference.id,
//       node.record.record.id,
//       selectedRecord.id,
//     )
//   })
//   const retainedEdges = node.edges.filter(
//     (edge) => edge.fromRecordId.value !== event.recordBeingEdited.id.value,
//   )
//   return [...retainedEdges, ...newFromEdges]
// }
//
// function updateFromInTargetModel(
//   node: EventSourcedRecordGraphNode,
//   event: RecordReferencesChangedEvent,
// ): RecordGraphEdge[] {
//   const isImpliedToSide = event.selection.some(
//     (selected) => selected.id.value === node.record.record.id.value,
//   )
//   if (isImpliedToSide) {
//     return [
//       recordGraphEdgeFns.newInstance(
//         event.modelReference.id,
//         node.record.record.id,
//         event.recordBeingEdited.id,
//       ),
//     ]
//   }
//   return []
// }
//
// function updateToInTargetModel(
//   node: EventSourcedRecordGraphNode,
//   event: RecordReferencesChangedEvent,
// ): RecordGraphEdge[] {
//   const isImpliedToSide = event.selection.some(
//     (selected) => selected.id.value === node.record.record.id.value,
//   )
//   if (isImpliedToSide) {
//     return [
//       recordGraphEdgeFns.newInstance(
//         event.modelReference.id,
//         node.record.record.id,
//         event.recordBeingEdited.id,
//       ),
//     ]
//   }
//   return []
// }
//
// function updateToInEditedRecord(
//   node: EventSourcedRecordGraphNode,
//   event: RecordReferencesChangedEvent,
// ): RecordGraphEdge[] {
//   if (node.record.record.id.value !== event.recordBeingEdited.id.value) {
//     return node.edges
//   }
//   const newToEdges = event.selection.map((selectedRecord) => {
//     return recordGraphEdgeFns.newInstance(
//       event.modelReference.id,
//       node.record.record.id,
//       selectedRecord.id,
//     )
//   })
//   const retainedEdges = node.edges.filter(
//     (edge) => edge.toRecordId.value !== event.recordBeingEdited.id.value,
//   )
//   return [...retainedEdges, ...newToEdges]
// }

function addReferencesChangedEventForward(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
): EventSourcedRecordGraph {
  const relevantEdges = graph.edges.filter(
    (edge) =>
      edge.modelReferenceId.value === event.modelReference.id.value &&
      edge.fromRecordId.value === event.recordBeingEdited.id.value,
  )
  const newEdges = event.selection.map((selectedRecord) => {
    return recordGraphEdgeFns.newInstance(
      event.modelReference.id,
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
      edge.toRecordId.value === event.recordBeingEdited.id.value,
  )
  const newEdges = event.selection.map((selectedRecord) => {
    return recordGraphEdgeFns.newInstance(
      event.modelReference.id,
      selectedRecord.id,
      event.recordBeingEdited.id,
    )
  })
  const retainedEdges = graph.edges.filter((edge) => !relevantEdges.includes(edge))
  return { ...graph, edges: [...retainedEdges, ...newEdges] }
}

/**
 * Given a one to many customer to booking relationship, this can be updated from either side.
 * When editing a customer, you can make 0 or more references to bookings
 * When editing a booking, you can make 0 or 1 reference to a customer
 */
// function updateEdges(
//   node: EventSourcedRecordGraphNode,
//   event: RecordReferencesChangedEvent,
//   targetModelId: ModelId,
// ): RecordGraphEdge[] {
//   if (node.record.record.modelId.value === event.recordBeingEdited.modelId.value) {
//     if (event.modelReference.side === 'from') {
//       return updateFromInEditedRecord(node, event)
//     } else {
//       return updateToInEditedRecord(node, event)
//     }
//   }
//   if (node.record.record.modelId.value === targetModelId.value) {
//     if (event.modelReference.side === 'from') {
//       return updateToInTargetModel(node, event)
//     } else {
//       return updateFromInTargetModel(node, event)
//     }
//   }
//   return node.edges
// }

function addReferencesChangedEvent(
  graph: EventSourcedRecordGraph,
  event: RecordReferencesChangedEvent,
): EventSourcedRecordGraph {
  if (event.modelReference.cardinality === 'one' && event.selection.length > 1) {
    throw new Error(`Cannot add multiple references to a one to one relationship`)
  }
  if (event.modelReference.direction === 'forward') {
    return addReferencesChangedEventForward(graph, event)
  } else {
    return addReferencesChangedEventInverse(graph, event)
  }
}

function recordIdMatches(
  modelReference: ModelReference,
  edge: RecordGraphEdge,
  recordId: DataRecordId,
) {
  if (modelReference.direction === 'forward') {
    return edge.fromRecordId.value === recordId.value
  }
  return edge.toRecordId.value === recordId.value
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
    if (modelReference.direction === 'forward') {
      return edges.map((edge) => edge.toRecordId)
    }
    return edges.map((edge) => edge.fromRecordId)
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
}
