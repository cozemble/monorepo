import type {
  Cardinality,
  ModelEvent,
  ModelEventDescriptor,
  ModelId,
  ModelIdAndName,
  ModelName,
  PropertyId,
  PropertyName,
  RelationshipName,
} from '@cozemble/model-core'
import { modelEventDescriptors, modelEventFns, propertyIdFns } from '@cozemble/model-core'
import { modelIdFns, relationshipFns } from '@cozemble/model-api'

export interface ModelRenamed extends ModelEvent {
  _type: 'model.renamed.event'
  newModelName: ModelName
}

function modelRenamed(modelId: ModelId, newModelName: ModelName): ModelRenamed {
  return {
    _type: 'model.renamed.event',
    ...modelEventFns.coreParts(modelId),
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
  newPropertyName: PropertyName
}

function propertyRenamed(
  modelId: ModelId,
  propertyId: PropertyId,
  newPropertyName: PropertyName,
): PropertyRenamed {
  return {
    _type: 'property.renamed.event',
    ...modelEventFns.coreParts(modelId),
    propertyId,
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
    ...modelEventFns.coreParts(parentModel.id),
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

function modelCreated(modelName: ModelName, modelId = modelIdFns.newInstance()): ModelCreated {
  return {
    _type: 'model.created.event',
    ...modelEventFns.coreParts(modelId),
    modelName,
  }
}

export interface BooleanPropertyChanged extends ModelEvent {
  _type: 'boolean.property.changed.event'
  propertyId: PropertyId
  booleanPropertyName: 'required' | 'unique'
  newValue: boolean
}

function booleanPropertyChanged(
  modelId: ModelId,
  propertyId: PropertyId,
  booleanPropertyName: 'required' | 'unique',
  newValue: boolean,
): BooleanPropertyChanged {
  return {
    _type: 'boolean.property.changed.event',
    ...modelEventFns.coreParts(modelId),
    propertyId,
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
      properties: model.properties.map((property) => {
        if (propertyIdFns.equals(property.id, event.propertyId)) {
          return {
            ...property,
            [event.booleanPropertyName]: event.newValue,
          }
        } else {
          return property
        }
      }),
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
