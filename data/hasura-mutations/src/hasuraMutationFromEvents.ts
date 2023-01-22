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
  type DataRecordAndPath,
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
import { type HeadAndTail, mandatory, strings } from '@cozemble/lang-util'

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
  allRecords: DataRecordAndPath[],
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
    const record = mandatory(
      allRecords.find((r) => dataRecordPathElementFns.same(r.parentElements, parentElements)),
      `Could not find record for path`,
    )
    gqlObjectFns.addValue(newRelationship.object, value('id', record.record.id.value))
    addAllReturningLines(models, pathElement.modelId, newRelationship.returning)
    obj.relationships.push(newRelationship)
    return newRelationship.object
  }, object)
}

function applyValueChange(
  models: Model[],
  relationship: ObjectRelationship,
  event: DataRecordValueChanged,
  allRecords: DataRecordAndPath[],
): ObjectRelationship {
  const addressedObject = getOrCreateAddressedObject(
    models,
    relationship.object,
    event.path.parentElements,
    allRecords,
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
  return gqlObject([value('id', record.id.value), ...values])
}

function applyHasManyAdded(
  models: Model[],
  relationship: ObjectRelationship,
  event: HasManyItemAdded,
  allRecords: DataRecordAndPath[],
): ObjectRelationship {
  const parentObject = getOrCreateAddressedObject(
    models,
    relationship.object,
    event.parentPath,
    allRecords,
  )
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
  allRecords: DataRecordAndPath[],
): ObjectRelationship {
  if (event._type === 'data.record.value.changed') {
    return applyValueChange(models, relationship, event, allRecords)
  }
  if (event._type === 'data.record.has.many.item.added') {
    return applyHasManyAdded(models, relationship, event, allRecords)
  }
  throw new Error(`Unknown event type: ${event._type}`)
}

function applyEvents(
  models: Model[],
  relationship: ObjectRelationship,
  remainingEvents: DataRecordEditEvent[],
  allRecords: DataRecordAndPath[],
): ObjectRelationship {
  return remainingEvents.reduce(
    (relationship, event) => applyEvent(models, relationship, event, allRecords),
    relationship,
  )
}

function objectRelationshipFromCreatedEvent(model: Model, createdEvent: DataRecordCreatedEvent) {
  const relationship = objectRelationship(model.name.value)
  gqlObjectFns.addValue(relationship.object, value('id', createdEvent.recordId.value))
  return relationship
}

function hasuraInsertMutation(
  models: Model[],
  createdEvent: DataRecordCreatedEvent,
  remainingEvents: DataRecordEditEvent[],
  allRecords: DataRecordAndPath[],
): GqlMutation {
  const model = modelFns.findById(models, createdEvent.modelId)
  const rootObject = applyEvents(
    models,
    objectRelationshipFromCreatedEvent(model, createdEvent),
    remainingEvents,
    allRecords,
  )
  addAllReturningLines(models, model.id, rootObject.returning)

  return gqlMutation(
    `mutation MyMutation {
  insert_${rootObject.name}(objects: ${gqlRelationshipFns.printSetStatement(rootObject)}) {
    returning {${printLines(gqlRelationshipFns.printReturning(rootObject))}}}}`,
  )
}

function flattenUpdateEvent(
  models: Model[],
  rootRecord: DataRecord,
  event: DataRecordEditEvent,
  acc: RecordIdAndObjectRelationship[],
) {
  if (event._type === 'data.record.value.changed') {
    const addressedRecord = dataRecordPathElementFns.getChildRecord(
      models,
      rootRecord,
      event.path.parentElements,
    )
    if (addressedRecord === null) {
      console.error({ models, event })
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

function flattenUpdateEvents(
  models: Model[],
  rootRecord: DataRecord,
  events: DataRecordEditEvent[],
) {
  return events.reduce(
    (acc, event) => flattenUpdateEvent(models, rootRecord, event, acc),
    [] as RecordIdAndObjectRelationship[],
  )
}

type RecordIdAndObjectRelationship = { recordId: DataRecordId; relationship: ObjectRelationship }

function updateGqlLines(
  models: Model[],
  record: DataRecord,
  events: DataRecordEditEvent[],
): string[] {
  const updateStatements = flattenUpdateEvents(models, record, events).map((r, index) => {
    return `update${index}: update_${r.relationship.name}(where: {id: {_eq: "${
      r.recordId.value
    }"}}, _set: ${gqlRelationshipFns.printSetStatement(r.relationship)}) {
    returning {${printLines(gqlRelationshipFns.printReturning(r.relationship))}}}`
  })
  return updateStatements
}

function deleteGqlLines(
  models: Model[],
  record: DataRecord,
  events: DataRecordEditEvent[],
): string[] {
  return events.flatMap((event, index) => {
    if (event._type === 'data.record.deleted') {
      const model = modelFns.findById(models, event.modelId)
      return [
        `delete${index}: delete_${strings.snakeCase(model.name.value)}(where: {id: {_eq: "${
          record.id.value
        }"}}) {
    affected_rows
  }`,
      ]
    } else {
      return []
    }
  })
}

function hasuraUpdateMutation(
  models: Model[],
  record: DataRecord,
  events: DataRecordEditEvent[],
): GqlMutation {
  const updateLines = updateGqlLines(models, record, events)
  const deleteLines = deleteGqlLines(models, record, events)

  return gqlMutation(
    `mutation MyMutation {
    ${updateLines}
    ${deleteLines}
}`,
  )
}

export function hasuraMutationFromEvents(
  models: Model[],
  allRecords: DataRecordAndPath[],
  record: DataRecord,
  events: HeadAndTail<DataRecordEditEvent>,
): GqlMutation {
  if (events.head._type === 'data.record.created') {
    return hasuraInsertMutation(models, events.head, events.tail, allRecords)
  }
  return hasuraUpdateMutation(models, record, [events.head, ...events.tail])
}
