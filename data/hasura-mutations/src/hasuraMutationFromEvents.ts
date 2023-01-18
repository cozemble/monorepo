import {
  arrayRelationship,
  ArrayRelationship,
  gqlMutation,
  GqlMutation,
  gqlObject,
  GqlObject,
  gqlObjectFns,
  gqlRelationshipFns,
  GqlReturningClause,
  gqlReturningClauseFns,
  ObjectRelationship,
  objectRelationship,
  printLines,
  value,
} from './graphql/core'
import {
  type DataRecord,
  type DataRecordPathElement,
  type Model,
  type ModelId,
  propertyDescriptors,
} from '@cozemble/model-core'
import type {
  DataRecordCreatedEvent,
  DataRecordEditEvent,
  DataRecordValueChanged,
  HasManyItemAdded,
} from '@cozemble/data-editor-sdk'
import { modelFns } from '@cozemble/model-api'
import { strings } from '@cozemble/lang-util'

function addAllReturningLines(
  models: Model[],
  modelId: ModelId,
  returning: GqlReturningClause,
): void {
  const model = modelFns.findById(models, modelId)
  model.properties.reduce((clause, property) => {
    gqlReturningClauseFns.addReturning(clause, property.name.value)
    return clause
  }, returning)
}

function getOrCreateAddressedObject(
  models: Model[],
  object: GqlObject,
  parentElements: DataRecordPathElement[],
): GqlObject {
  return parentElements.reduce((obj, pathElement) => {
    if (pathElement._type === 'has.many.relationship.path.element') {
      throw new Error('Not implemented')
    }
    const maybeExistingRelationship = obj.relationships.find(
      (r) => r.name === strings.snakeCase(pathElement.name.value),
    ) as ObjectRelationship
    if (maybeExistingRelationship) {
      return maybeExistingRelationship.object
    }
    const newRelationship = objectRelationship(pathElement.name.value)
    addAllReturningLines(models, pathElement.modelId, newRelationship.returning)
    obj.relationships.push(newRelationship)
    return newRelationship.object
  }, object)
}

function applyValueChange(
  models: Model[],
  relationship: ObjectRelationship,
  event: DataRecordValueChanged,
): ObjectRelationship {
  const addressedObject = getOrCreateAddressedObject(
    models,
    relationship.object,
    event.path.parentElements,
  )
  gqlObjectFns.addValue(addressedObject, value(event.path.lastElement.name.value, event.newValue))
  return relationship
}

function toGqlObject(models: Model[], record: DataRecord): GqlObject {
  const model = modelFns.findById(models, record.modelId)
  const values = model.properties.flatMap((property) => {
    if (record.values[property.id.value] !== undefined) {
      const fetchedValue = propertyDescriptors.mandatory(property).getValue(property, record)
      return value(property.name.value, fetchedValue)
    }
    return []
  })
  return gqlObject(values)
}

function applyHasManyAdded(
  models: Model[],
  relationship: ObjectRelationship,
  event: HasManyItemAdded,
): ObjectRelationship {
  const parentObject = getOrCreateAddressedObject(models, relationship.object, event.parentPath)
  const maybeArrayRelationship = parentObject.relationships.find(
    (r) => r.name === strings.snakeCase(event.relationship.name.value),
  ) as ArrayRelationship
  if (maybeArrayRelationship) {
    maybeArrayRelationship.objects.push(toGqlObject(models, event.newRecord))
    return relationship
  } else {
    const newRelationship = arrayRelationship(event.relationship.name.value)
    addAllReturningLines(models, event.relationship.modelId, newRelationship.returning)
    newRelationship.objects.push(toGqlObject(models, event.newRecord))
    parentObject.relationships.push(newRelationship)
    return relationship
  }
}

function applyEvent(
  models: Model[],
  relationship: ObjectRelationship,
  event: DataRecordEditEvent,
): ObjectRelationship {
  if (event._type === 'data.record.value.changed') {
    return applyValueChange(models, relationship, event)
  }
  if (event._type === 'data.record.has.many.item.added') {
    return applyHasManyAdded(models, relationship, event)
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
  const rootObject = applyEvents(models, objectRelationship(model.name.value), remainingEvents)
  addAllReturningLines(models, model.id, rootObject.returning)

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
