import { expect, test } from 'vitest'
import {
  coreModelEvents,
  EventSourcedModel,
  eventSourcedModelFns,
  ModelCreated,
  ModelRenamed,
} from '../src'
import {
  type Model,
  type ModelEvent,
  modelEventFns,
  modelNameFns,
  timestampEpochMillis,
} from '@cozemble/model-core'
import { modelIdFns } from '@cozemble/model-api'

test('is ok with no events', () => {
  const models = eventSourcedModelFns.playAll([], () => {
    throw new Error('should not be called')
  })
  expect(models).toEqual([])
})

test('handle one model created event', () => {
  const event = coreModelEvents.modelCreated(
    modelNameFns.newInstance('my model'),
    modelIdFns.newInstance(),
  )
  const collected: ModelEvent[] = []
  const models = eventSourcedModelFns.playAll([event], (event) => {
    collected.push(event)
  })
  expect(collected).toEqual([event])
  expect(models).toEqual([eventSourcedModelFns.fromCreatedEvent(event)])
})

test('handle two model created events', () => {
  const createCustomerEvent = coreModelEvents.modelCreated(
    modelNameFns.newInstance('customer'),
    modelIdFns.newInstance(),
  )
  const createAddressEvent = coreModelEvents.modelCreated(
    modelNameFns.newInstance('address'),
    modelIdFns.newInstance(),
  )
  const collected: ModelEvent[] = []
  const models = eventSourcedModelFns.playAll(
    [createCustomerEvent, createAddressEvent],
    (event) => {
      collected.push(event)
    },
  )
  expect(collected).toEqual([createCustomerEvent, createAddressEvent])
  expect(models).toEqual([
    eventSourcedModelFns.fromCreatedEvent(createCustomerEvent),
    eventSourcedModelFns.fromCreatedEvent(createAddressEvent),
  ])
})

test('a mutation event without a preceding model created event is an error', () => {
  const modelRenamedEvent = coreModelEvents.modelRenamed(
    modelIdFns.newInstance(),
    modelNameFns.newInstance('new name'),
  )
  let gotToNextLine = false
  try {
    eventSourcedModelFns.playAll([modelRenamedEvent], () => {
      throw new Error('should not be called')
    })
    gotToNextLine = true
  } catch (e) {
    expect(e.message).toMatch(/no model found for model id/)
  }
  expect(gotToNextLine).toBe(false)
})

test('create and rename a model', () => {
  const createEvent = coreModelEvents.modelCreated(
    modelNameFns.newInstance('my model'),
    modelIdFns.newInstance(),
  )
  const renameEvent = coreModelEvents.modelRenamed(
    createEvent.modelId,
    modelNameFns.newInstance('new name'),
  )
  const collectedEvents: ModelEvent[] = []
  const collectedModels: Model[][] = []
  const models = eventSourcedModelFns.playAll(
    [createEvent, renameEvent],
    (event, oldModel, newModels) => {
      collectedEvents.push(event)
      collectedModels.push([oldModel, ...newModels])
    },
  )
  expect(collectedEvents).toEqual([createEvent, renameEvent])
  const createdModel: EventSourcedModel = eventSourcedModelFns.fromCreatedEvent(createEvent)
  const renamedModel: EventSourcedModel = {
    ...createdModel,
    model: { ...createdModel.model, name: renameEvent.newModelName },
    events: [...createdModel.events, { ...renameEvent, insertionOrder: 1 }],
  }
  expect(collectedModels).toEqual([
    [null, createdModel.model],
    [createdModel.model, renamedModel.model],
  ])
  expect(models).toEqual([renamedModel])
})

test('events are time ordered', () => {
  const createEvent: ModelCreated = {
    ...coreModelEvents.modelCreated(modelNameFns.newInstance('my model'), modelIdFns.newInstance()),
    timestamp: timestampEpochMillis(0),
  }
  const renameEvent: ModelRenamed = {
    ...coreModelEvents.modelRenamed(createEvent.modelId, modelNameFns.newInstance('new name')),
    timestamp: timestampEpochMillis(1),
  }
  const models = eventSourcedModelFns.playAll([renameEvent, createEvent], () => {})
  const createdModel: EventSourcedModel = eventSourcedModelFns.fromCreatedEvent(createEvent)
  const renamedModel: EventSourcedModel = {
    ...createdModel,
    model: { ...createdModel.model, name: renameEvent.newModelName },
    events: [...createdModel.events, { ...renameEvent, insertionOrder: 1 }],
  }
  expect(models).toEqual([renamedModel])
})

test('events with the same timestamp are time ordered by their insertion order', () => {
  const timestamp = timestampEpochMillis(0)
  const createEvent = modelEventFns.withOptions(
    coreModelEvents.modelCreated(modelNameFns.newInstance('my model'), modelIdFns.newInstance()),
    { timestamp, insertionOrder: 0 },
  )
  const renameEvent = modelEventFns.withOptions(
    coreModelEvents.modelRenamed(createEvent.modelId, modelNameFns.newInstance('new name')),
    { timestamp, insertionOrder: 1 },
  )
  const orderA: ModelEvent[] = []
  const orderB: ModelEvent[] = []
  eventSourcedModelFns.playAll([createEvent, renameEvent], (event) => {
    orderA.push(event)
  })
  eventSourcedModelFns.playAll([renameEvent, createEvent], (event) => {
    orderB.push(event)
  })
  expect(orderA).toEqual([createEvent, renameEvent])
  expect(orderB).toEqual([createEvent, renameEvent])
})
