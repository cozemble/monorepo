import { EventSourcedModel } from './EventSourcedModel'
import { ModelEdge, ModelEvent } from '@cozemble/model-core'
import { eventSourcedModelFns } from './eventSourcedModelFns'
import { Model } from '@cozemble/model-core/dist/esm'

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

export interface AddModelEdgeEvent {
  _type: 'add.model.edge.event'
  edge: ModelEdge
}

export interface AddModelEvent {
  _type: 'add.model.event'
  model: Model
}

export type ModelGraphEvent = AddModelEdgeEvent | AddModelEvent

function modelGraphReducer(
  graph: EventSourcedModelGraph,
  event: ModelGraphEvent,
): EventSourcedModelGraph {
  switch (event._type) {
    case 'add.model.edge.event':
      return {
        ...graph,
        edges: [
          ...graph.edges,
          {
            _type: 'event.sourced.model.edge',
            edge: event.edge,
            events: [],
          },
        ],
      }
    case 'add.model.event':
      return {
        ...graph,
        models: [
          ...graph.models,
          {
            _type: 'event.sourced.model',
            model: event.model,
            events: [],
          },
        ],
      }
  }
}

export const eventSourcedModelGraphFns = {
  newInstance: (
    models: EventSourcedModel[] = [],
    edges: EventSourcedModelEdge[] = [],
  ): EventSourcedModelGraph => ({
    _type: 'event.sourced.model.graph',
    models,
    edges,
  }),
  applyModelGraphEvent: (
    graph: EventSourcedModelGraph,
    event: ModelGraphEvent,
  ): EventSourcedModelGraph => {
    return modelGraphReducer(graph, event)
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
  addModelEdge: (edge: ModelEdge): AddModelEdgeEvent => ({
    _type: 'add.model.edge.event',
    edge,
  }),
  addModel: (model: Model): AddModelEvent => ({
    _type: 'add.model.event',
    model,
  }),
}
