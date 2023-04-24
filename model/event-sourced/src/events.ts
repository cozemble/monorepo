import type {
  Cardinality,
  ModelEvent,
  ModelEventDescriptor,
  ModelId,
  ModelIdAndName,
  ModelName,
  PropertyId,
} from '@cozemble/model-core'
import {
  modelEventDescriptors,
  modelEventFns,
  ModelSlotId,
  ModelSlotName,
  NestedModelName,
  PropertyName,
} from '@cozemble/model-core'
import { modelIdFns, nestedModelFns } from '@cozemble/model-api'
import { ModelPluralName } from '@cozemble/model-core/dist/esm/core'

export interface ModelRenamed extends ModelEvent {
  _type: 'model.renamed.event'
  newModelName: ModelName
}

export interface ModelPluralRenamed extends ModelEvent {
  _type: 'model.plural.renamed.event'
  newName: ModelPluralName
}

function modelRenamed(modelId: ModelId, newModelName: ModelName): ModelRenamed {
  return {
    _type: 'model.renamed.event',
    ...modelEventFns.coreParts(modelId),
    newModelName,
  }
}

function modelPluralRenamed(modelId: ModelId, newName: ModelPluralName): ModelPluralRenamed {
  return {
    _type: 'model.plural.renamed.event',
    ...modelEventFns.coreParts(modelId),
    newName,
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

const modelPluralRenamedDescriptor: ModelEventDescriptor<ModelPluralRenamed> = {
  _type: 'model.event.descriptor',
  modelEventType: 'model.plural.renamed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      pluralName: event.newName,
    }
  },
}

export interface SlotRenamed extends ModelEvent {
  _type: 'slot.renamed.event'
  modelSlotId: ModelSlotId
  newName: ModelSlotName
}

function slotRenamed(
  modelId: ModelId,
  modelSlotId: ModelSlotId,
  newName: ModelSlotName,
): SlotRenamed {
  return {
    _type: 'slot.renamed.event',
    ...modelEventFns.coreParts(modelId),
    modelSlotId,
    newName,
  }
}

const modelSlotRenamedDescriptor: ModelEventDescriptor<SlotRenamed> = {
  _type: 'model.event.descriptor',
  modelEventType: 'slot.renamed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      slots: model.slots.map((slot) => {
        if (slot.id.value === event.modelSlotId.value) {
          if (slot._type === 'property') {
            return {
              ...slot,
              name: event.newName as PropertyName,
            }
          }
          throw new Error(`Cannot rename a model slot of type ${slot._type}`)
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
modelEventDescriptors.register(modelPluralRenamedDescriptor)
modelEventDescriptors.register(modelSlotRenamedDescriptor)
modelEventDescriptors.register(nestedModelAddedDescriptor)
modelEventDescriptors.register(booleanPropertyChangeDescriptor)

export const coreModelEvents = {
  modelRenamed,
  modelPluralRenamed,
  slotRenamed,
  nestedModelAdded,
  modelCreated,
  booleanPropertyChanged,
}
