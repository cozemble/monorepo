import {
  arrayRelationship,
  type ArrayRelationship,
  gqlMutation,
  type GqlMutation,
  gqlObject,
  type GqlObject,
  gqlObjectFns,
  gqlRelationshipFns,
  type GqlReturningClause,
  gqlReturningClauseFns,
  type ObjectRelationship,
  objectRelationship,
  printLines,
  value,
} from '@cozemble/graphql-core'
import {
  type DataRecord,
  type DataRecordId,
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
import { dataRecordPathElementFns, modelFns } from '@cozemble/model-api'
import { strings } from '@cozemble/lang-util'

function ensureReturningId(returning: GqlReturningClause): GqlReturningClause {
  if (returning.value.find((l) => l === 'id')) {
    return returning
  }
  gqlReturningClauseFns.addReturning(returning, 'id')
  return returning
}

function addAllReturningLines(
  models: Model[],
  modelId: ModelId,
  returning: GqlReturningClause,
): void {
  const model = modelFns.findById(models, modelId)
  model.properties.reduce((clause, property) => {
    gqlReturningClauseFns.addReturning(clause, property.name.value)
    return clause
  }, ensureReturningId(returning))
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

function flattenUpdateEvent(
  models: Model[],
  event: DataRecordEditEvent,
  acc: RecordIdAndObjectRelationship[],
) {
  if (event._type === 'data.record.value.changed') {
    const addressedRecord = dataRecordPathElementFns.getChildRecord(
      models,
      event.record,
      event.path.parentElements,
    )
    if (addressedRecord === null) {
      throw new Error('Change event path addressed a null record')
    }
    let recordIdAndObjectRelationship = acc.find(
      (r) => r.recordId.value === addressedRecord.id.value,
    )
    if (!recordIdAndObjectRelationship) {
      const model = modelFns.findById(models, addressedRecord.modelId)
      const newObjectRelationship = objectRelationship(model.name.value)
      addAllReturningLines(models, model.id, newObjectRelationship.returning)
      recordIdAndObjectRelationship = {
        recordId: addressedRecord.id,
        relationship: newObjectRelationship,
      }
      acc.push(recordIdAndObjectRelationship)
    }
    gqlObjectFns.addValue(
      recordIdAndObjectRelationship.relationship.object,
      value(event.path.lastElement.name.value, event.newValue),
    )

    return acc
  }
  return acc
}

function flattenUpdateEvents(models: Model[], events: DataRecordEditEvent[]) {
  return events.reduce(
    (acc, event) => flattenUpdateEvent(models, event, acc),
    [] as RecordIdAndObjectRelationship[],
  )
}

type RecordIdAndObjectRelationship = { recordId: DataRecordId; relationship: ObjectRelationship }

function hasuraUpdateMutation(
  models: Model[],
  record: DataRecord,
  events: DataRecordEditEvent[],
): GqlMutation {
  const flattened: RecordIdAndObjectRelationship[] = flattenUpdateEvents(models, events)

  const lines = flattened.map((r, index) => {
    return `update${index}: update_${r.relationship.name}(where: {id: {_eq: "${
      r.recordId.value
    }"}}, _set: ${gqlRelationshipFns.printSetStatement(r.relationship)}) {
    returning {${printLines(gqlRelationshipFns.printReturning(r.relationship))}}}`
  })

  return gqlMutation(
    `mutation MyMutation {
    ${lines}
}`,
  )
}

export function hasuraMutationFromEvents(
  models: Model[],
  record: DataRecord,
  events: DataRecordEditEvent[],
): GqlMutation {
  if (events.length === 0) {
    throw new Error('No events')
  }
  const [firstEvent, ...remainingEvents] = events
  if (firstEvent._type === 'data.record.created') {
    return hasuraInsertMutation(models, firstEvent, remainingEvents)
  }
  return hasuraUpdateMutation(models, record, events)
}
