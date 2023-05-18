import { EventSourcedDataRecord, eventSourcedDataRecordFns } from './EventSourcedDataRecord'
import { DataRecordEditEvent } from './dataRecordEditEvents'
import { SystemConfiguration } from '@cozemble/model-core'
import { RecordGraphEdge } from '@cozemble/model-core'
import { Model } from '@cozemble/model-core'

export interface EventSourcedRecordGraphNode {
  _type: 'event.sourced.record.graph.node'
  record: EventSourcedDataRecord
  edges: RecordGraphEdge[]
  recordEvents: DataRecordEditEvent[]
}

export const eventSourcedRecordGraphNodeFns = {
  newInstance: (
    record: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    recordEvents: DataRecordEditEvent[] = [],
  ): EventSourcedRecordGraphNode => ({
    _type: 'event.sourced.record.graph.node',
    record,
    edges,
    recordEvents,
  }),
  addRecordEditEvent(
    systemConfiguration: SystemConfiguration,
    node: EventSourcedRecordGraphNode,
    event: DataRecordEditEvent,
  ): EventSourcedRecordGraphNode {
    const mutatedRecord = eventSourcedDataRecordFns.addEvent(
      systemConfiguration,
      event,
      node.record,
    )
    return {
      ...node,
      record: mutatedRecord,
      recordEvents: [...node.recordEvents, event],
    }
  },
  updateModelsInDataRecord(
    models: Model[],
    node: EventSourcedRecordGraphNode,
  ): EventSourcedRecordGraphNode {
    return { ...node, record: eventSourcedDataRecordFns.updateModels(models, node.record) }
  },
}
