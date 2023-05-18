import {
  DataRecord,
  DataRecordId,
  Model,
  RecordGraph,
  SystemConfiguration,
} from '@cozemble/model-core'
import { DataRecordEditEvent } from './dataRecordEditEvents'
import {
  EventSourcedRecordGraphNode,
  eventSourcedRecordGraphNodeFns,
} from './EventSourcedRecordGraphNode'
import { EventSourcedDataRecord, eventSourcedDataRecordFns } from './EventSourcedDataRecord'

export interface EventSourcedRecordGraph {
  _type: 'event.sourced.record.graph'
  nodes: EventSourcedRecordGraphNode[]
  relatedRecords: DataRecord[]
}

export const eventSourcedRecordGraphFns = {
  newInstance: (
    nodes: EventSourcedRecordGraphNode[],
    relatedRecords: DataRecord[],
  ): EventSourcedRecordGraph => ({
    _type: 'event.sourced.record.graph',
    nodes,
    relatedRecords,
  }),
  fromRecordGraph: (models: Model[], graph: RecordGraph): EventSourcedRecordGraph => {
    return eventSourcedRecordGraphFns.newInstance(
      graph.nodes.map((node) =>
        eventSourcedRecordGraphNodeFns.newInstance(
          eventSourcedDataRecordFns.fromRecord(models, node.record),
          node.edges,
          [],
        ),
      ),
      graph.relatedRecords,
    )
  },
  appendRecord: (
    graph: EventSourcedRecordGraph,
    record: EventSourcedRecordGraphNode | EventSourcedDataRecord,
  ): EventSourcedRecordGraph => {
    const newNode =
      record._type === 'event.sourced.record.graph.node'
        ? record
        : eventSourcedRecordGraphNodeFns.newInstance(record, [])
    return {
      ...graph,
      nodes: [...graph.nodes, newNode],
    }
  },
  addRecordEditEvent: (
    systemConfiguration: SystemConfiguration,
    graph: EventSourcedRecordGraph,
    recordId: DataRecordId,
    event: DataRecordEditEvent,
  ): EventSourcedRecordGraph => {
    const node = graph.nodes.find((node) => node.record.record.id.value === recordId.value)
    if (!node) {
      throw new Error('Record not found: ' + recordId)
    }
    const mutatedNode = eventSourcedRecordGraphNodeFns.addRecordEditEvent(
      systemConfiguration,
      node,
      event,
    )
    return {
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.record.record.id.value === recordId.value ? mutatedNode : n,
      ),
    }
  },
  updateModelsInDataRecords: (
    graph: EventSourcedRecordGraph,
    models: Model[],
  ): EventSourcedRecordGraph => {
    return {
      ...graph,
      nodes: graph.nodes.map((node) =>
        eventSourcedRecordGraphNodeFns.updateModelsInDataRecord(models, node),
      ),
    }
  },
  getRecords: (graph: EventSourcedRecordGraph): EventSourcedDataRecord[] => {
    return graph.nodes.map((node) => node.record)
  },
  recordWithId(graph: EventSourcedRecordGraph, recordId: DataRecordId): EventSourcedDataRecord {
    const node = graph.nodes.find((node) => node.record.record.id.value === recordId.value)
    if (!node) {
      throw new Error('Record not found: ' + recordId)
    }
    return node.record
  },
}
