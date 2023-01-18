import {
  gqlMutation,
  GqlMutation,
  gqlRelationshipFns,
  ObjectRelationship,
  objectRelationship,
  printLines,
  value,
} from './graphql/core'
import { type DataRecordPathElement, type Model, ModelId } from '@cozemble/model-core'
import type {
  DataRecordCreatedEvent,
  DataRecordEditEvent,
  DataRecordValueChanged,
} from '@cozemble/data-editor-sdk'
import { modelFns } from '@cozemble/model-api'
import { strings } from '@cozemble/lang-util'

function addAllReturningLines(models: Model[], modelId: ModelId, relationship: ObjectRelationship) {
  const model = modelFns.findById(models, modelId)
  return model.properties.reduce((relationship, property) => {
    return gqlRelationshipFns.addReturning(relationship, property.name.value)
  }, relationship)
}

function getOrCreateAddressedRelationship(
  models: Model[],
  relationship: ObjectRelationship,
  parentElements: DataRecordPathElement[],
) {
  return parentElements.reduce((relationship, pathElement) => {
    if (pathElement._type === 'has.many.relationship.path.element') {
      throw new Error('Not implemented')
    }
    const maybeExistingRelationship = relationship.relationships.find(
      (r) => r.name === strings.snakeCase(pathElement.name.value),
    )
    if (maybeExistingRelationship) {
      return maybeExistingRelationship as ObjectRelationship
    }
    const newRelationship = addAllReturningLines(
      models,
      pathElement.modelId,
      objectRelationship(pathElement.name.value),
    )
    relationship.relationships.push(newRelationship)
    return newRelationship
  }, relationship)
}

function applyValueChange(
  models: Model[],
  relationship: ObjectRelationship,
  event: DataRecordValueChanged,
): ObjectRelationship {
  const addressedRelationship = getOrCreateAddressedRelationship(
    models,
    relationship,
    event.path.parentElements,
  )
  gqlRelationshipFns.addValue(
    addressedRelationship,
    value(event.path.lastElement.name.value, event.newValue),
  )
  return relationship
}

function applyEvent(
  models: Model[],
  relationship: ObjectRelationship,
  event: DataRecordEditEvent,
): ObjectRelationship {
  if (event._type === 'data.record.value.changed') {
    return applyValueChange(models, relationship, event)
  }
  throw new Error(`Unknown event type: ${event._type}`)
}

function applyEvents(
  models: Model[],
  relationship: ObjectRelationship,
  remainingEvents: DataRecordEditEvent[],
): ObjectRelationship {
  return remainingEvents.reduce(
    (relationship, event) => applyEvent(models, relationship, event),
    relationship,
  )
}

function hasuraInsertMutation(
  models: Model[],
  createdEvent: DataRecordCreatedEvent,
  remainingEvents: DataRecordEditEvent[],
): GqlMutation {
  const model = modelFns.findById(models, createdEvent.modelId)
  const rootObject = applyEvents(
    models,
    addAllReturningLines(models, model.id, objectRelationship(model.name.value)),
    remainingEvents,
  )

  return gqlMutation(
    `mutation MyMutation {
  insert_${rootObject.name}(objects: ${gqlRelationshipFns.printSetStatement(rootObject)}) {
    returning {${printLines(gqlRelationshipFns.printReturning(rootObject))}}}}`,
  )
}

export function hasuraMutationFromEvents(
  models: Model[],
  events: DataRecordEditEvent[],
): GqlMutation {
  if (events.length === 0) {
    throw new Error('No events')
  }
  const [firstEvent, ...remainingEvents] = events
  if (firstEvent._type !== 'data.record.created') {
    throw new Error('First event must be a data.record.created')
  }
  return hasuraInsertMutation(models, firstEvent, remainingEvents)
}
