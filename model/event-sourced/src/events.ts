import type {
  Cardinality,
  ModelEvent,
  ModelEventDescriptor,
  ModelIdAndName,
  ModelName,
  PropertyId,
  PropertyName,
  RelationshipName,
} from '@cozemble/model-core'
import {
  modelEventDescriptors,
  modelEventIdFns,
  propertyIdFns,
  timestampEpochMillis,
} from '@cozemble/model-core'
import { relationshipFns } from '@cozemble/model-api'

export interface ModelRenamed extends ModelEvent {
  _type: 'model.renamed.event'
  oldModelName: ModelName
  newModelName: ModelName
}

function modelRenamed(oldModelName: ModelName, newModelName: ModelName): ModelRenamed {
  return {
    _type: 'model.renamed.event',
    timestamp: timestampEpochMillis(),
    id: modelEventIdFns.newInstance(),
    oldModelName,
    newModelName,
  }
}

const modelRenamedDescriptor: ModelEventDescriptor<ModelRenamed> = {
  _type: 'model.event.descriptor',
  modelEventType: 'model.renamed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      name: event.newModelName,
    }
  },
}

export interface PropertyRenamed extends ModelEvent {
  _type: 'property.renamed.event'
  propertyId: PropertyId
  modelName: ModelName
  oldPropertyName: PropertyName
  newPropertyName: PropertyName
}

function propertyRenamed(
  modelName: ModelName,
  propertyId: PropertyId,
  oldPropertyName: PropertyName,
  newPropertyName: PropertyName,
): PropertyRenamed {
  return {
    _type: 'property.renamed.event',
    timestamp: timestampEpochMillis(),
    id: modelEventIdFns.newInstance(),
    propertyId,
    modelName,
    oldPropertyName,
    newPropertyName,
  }
}

const propertyRenamedDescriptor: ModelEventDescriptor<PropertyRenamed> = {
  _type: 'model.event.descriptor',
  modelEventType: 'property.renamed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      properties: model.properties.map((property) => {
        if (propertyIdFns.equals(property.id, event.propertyId)) {
          return {
            ...property,
            name: event.newPropertyName,
          }
        } else {
          return property
        }
      }),
    }
  },
}

export interface RelationshipAdded extends ModelEvent {
  _type: 'relationship.added.event'
  cardinality: Cardinality
  parentModel: ModelIdAndName
  childModel: ModelIdAndName
  relationshipName: RelationshipName
}

function relationshipAdded(
  parentModel: ModelIdAndName,
  childModel: ModelIdAndName,
  cardinality: Cardinality,
  relationshipName: RelationshipName,
): RelationshipAdded {
  return {
    _type: 'relationship.added.event',
    timestamp: timestampEpochMillis(),
    id: modelEventIdFns.newInstance(),
    parentModel,
    childModel,
    cardinality,
    relationshipName,
  }
}

const relationshipAddedDescriptor: ModelEventDescriptor<RelationshipAdded> = {
  _type: 'model.event.descriptor',
  modelEventType: 'relationship.added.event',
  applyEvent: (model, event) => {
    const newRelationship = relationshipFns.newInstance(
      event.relationshipName,
      event.childModel.id,
      event.cardinality,
    )
    return {
      ...model,
      relationships: [...model.relationships, newRelationship],
    }
  },
}

export interface ModelCreated extends ModelEvent {
  _type: 'model.created.event'
  modelName: ModelName
}

function modelCreated(modelName: ModelName): ModelCreated {
  return {
    _type: 'model.created.event',
    timestamp: timestampEpochMillis(),
    id: modelEventIdFns.newInstance(),
    modelName,
  }
}

export interface BooleanPropertyChanged extends ModelEvent {
  _type: 'boolean.property.changed.event'
  propertyName: PropertyName
  modelName: ModelName
  booleanPropertyName: 'required' | 'unique'
  newValue: boolean
}

function booleanPropertyChanged(
  modelName: ModelName,
  propertyName: PropertyName,
  booleanPropertyName: 'required' | 'unique',
  newValue: boolean,
): BooleanPropertyChanged {
  return {
    _type: 'boolean.property.changed.event',
    timestamp: timestampEpochMillis(),
    id: modelEventIdFns.newInstance(),
    propertyName,
    modelName,
    booleanPropertyName,
    newValue,
  }
}

const booleanPropertyChangeDescriptor: ModelEventDescriptor<BooleanPropertyChanged> = {
  _type: 'model.event.descriptor',
  modelEventType: 'boolean.property.changed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      [event.booleanPropertyName]: event.newValue,
    }
  },
}

modelEventDescriptors.register(modelRenamedDescriptor)
modelEventDescriptors.register(propertyRenamedDescriptor)
modelEventDescriptors.register(relationshipAddedDescriptor)
modelEventDescriptors.register(booleanPropertyChangeDescriptor)

export const coreModelEvents = {
  modelRenamed,
  propertyRenamed,
  relationshipAdded,
  modelCreated,
  booleanPropertyChanged,
}
