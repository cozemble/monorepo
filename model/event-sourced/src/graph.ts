import { EventSourcedModel } from './EventSourcedModel'
import { ModelEdge, ModelEvent } from '@cozemble/model-core'
import { eventSourcedModelFns } from './eventSourcedModelFns'

export type ModelEdgeEvent = any

export interface EventSourcedModelEdge {
  _type: 'event.sourced.model.edge'
  edge: ModelEdge
  events: ModelEdgeEvent[]
}

export interface EventSourcedModelGraph {
  _type: 'event.sourced.model.graph'
  models: EventSourcedModel[]
  edges: EventSourcedModelEdge[]
}

export interface AddModelGraphEdgeEvent {
  _type: 'add.model.graph.edge.event'
  edge: ModelEdge
}

export type ModelGraphEvent = AddModelGraphEdgeEvent

export const eventSourcedModelGraphFns = {
  newInstance: (
    models: EventSourcedModel[],
    edges: EventSourcedModelEdge[],
  ): EventSourcedModelGraph => ({
    _type: 'event.sourced.model.graph',
    models,
    edges,
  }),
  applyModelGraphEvent: (
    graph: EventSourcedModelGraph,
    event: ModelGraphEvent,
  ): EventSourcedModelGraph => {
    return graph
  },
  applyModelEvent: (graph: EventSourcedModelGraph, event: ModelEvent): EventSourcedModelGraph => {
    return {
      ...graph,
      models: graph.models.map((model) => {
        if (model.model.id.value === event.modelId.value) {
          return eventSourcedModelFns.addEvent(model, event)
        } else {
          return model
        }
      }),
    }
  },
}

export const modelGraphEvents = {
  addModelGraphEdge: (edge: ModelEdge): AddModelGraphEdgeEvent => ({
    _type: 'add.model.graph.edge.event',
    edge,
  }),
}
