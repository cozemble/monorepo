import type {
  Cardinality,
  ModelEvent,
  ModelEventDescriptor,
  ModelId,
  ModelIdAndName,
  ModelName,
  PropertyId,
  PropertyName,
} from '@cozemble/model-core'
import { modelEventDescriptors, modelEventFns, NestedModelName } from '@cozemble/model-core'
import { modelIdFns, nestedModelFns } from '@cozemble/model-api'

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
      slots: model.slots.map((slot) => {
        if (slot.id.value === event.propertyId.value && slot._type === 'property') {
          return {
            ...slot,
            name: event.newPropertyName,
          }
        } else {
          return slot
        }
      }),
    }
  },
}

export interface NestedModelAdded extends ModelEvent {
  _type: 'nested.model.added.event'
  cardinality: Cardinality
  parentModel: ModelIdAndName
  childModel: ModelIdAndName
  nestedModelName: NestedModelName
}

function nestedModelAdded(
  parentModel: ModelIdAndName,
  childModel: ModelIdAndName,
  cardinality: Cardinality,
  nestedModelName: NestedModelName,
): NestedModelAdded {
  return {
    _type: 'nested.model.added.event',
    ...modelEventFns.coreParts(parentModel.id),
    parentModel,
    childModel,
    cardinality,
    nestedModelName,
  }
}

const nestedModelAddedDescriptor: ModelEventDescriptor<NestedModelAdded> = {
  _type: 'model.event.descriptor',
  modelEventType: 'nested.model.added.event',
  applyEvent: (model, event) => {
    const newNestedModel = nestedModelFns.newInstance(
      event.nestedModelName,
      event.childModel.id,
      event.cardinality,
    )
    return {
      ...model,
      nestedModels: [...model.nestedModels, newNestedModel],
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
      slots: model.slots.map((property) => {
        if (property.id.value === event.propertyId.value && property._type === 'property') {
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
modelEventDescriptors.register(nestedModelAddedDescriptor)
modelEventDescriptors.register(booleanPropertyChangeDescriptor)

export const coreModelEvents = {
  modelRenamed,
  propertyRenamed,
  nestedModelAdded,
  modelCreated,
  booleanPropertyChanged,
}
