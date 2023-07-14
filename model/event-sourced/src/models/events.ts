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
  modelIdFns,
  ModelPluralName,
  ModelSlotId,
  ModelSlotName,
  NestedModelId,
  nestedModelIdFns,
  NestedModelName,
  PropertyName,
} from '@cozemble/model-core'
import { nestedModelFns } from '@cozemble/model-api'
import { ModelSlot } from '@cozemble/model-core'

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

export interface SlotChanged extends ModelEvent {
  _type: 'slot.changed.event'
  modelSlotId: ModelSlotId
  changedSlot: ModelSlot
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

function slotChanged(
  modelId: ModelId,
  modelSlotId: ModelSlotId,
  changedSlot: ModelSlot,
): SlotChanged {
  return {
    _type: 'slot.changed.event',
    ...modelEventFns.coreParts(modelId),
    modelSlotId,
    changedSlot,
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

const modelSlotChangedDescriptor: ModelEventDescriptor<SlotChanged> = {
  _type: 'model.event.descriptor',
  modelEventType: 'slot.changed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      slots: model.slots.map((slot) => {
        if (slot.id.value === event.modelSlotId.value) {
          return event.changedSlot
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
  nestedModelId: NestedModelId
}

function nestedModelAdded(
  parentModel: ModelIdAndName,
  childModel: ModelIdAndName,
  cardinality: Cardinality,
  nestedModelName: NestedModelName,
  nestedModelId = nestedModelIdFns.newInstance(),
): NestedModelAdded {
  return {
    _type: 'nested.model.added.event',
    ...modelEventFns.coreParts(parentModel.id),
    parentModel,
    childModel,
    cardinality,
    nestedModelName,
    nestedModelId,
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
      event.nestedModelId,
    )
    return {
      ...model,
      nestedModels: [...model.nestedModels, newNestedModel],
    }
  },
}

export interface NestedModelRenamed extends ModelEvent {
  _type: 'nested.model.renamed.event'
  parentModelId: ModelId
  nestedModelId: NestedModelId
  newName: NestedModelName
}

function nestedModelRenamed(
  parentModelId: ModelId,
  nestedModelId: NestedModelId,
  newName: NestedModelName,
): NestedModelRenamed {
  return {
    _type: 'nested.model.renamed.event',
    ...modelEventFns.coreParts(parentModelId),
    parentModelId,
    nestedModelId,
    newName,
  }
}

const nestedModelRenamedDescriptor: ModelEventDescriptor<NestedModelRenamed> = {
  _type: 'model.event.descriptor',
  modelEventType: 'nested.model.renamed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      nestedModels: model.nestedModels.map((nestedModel) => {
        if (nestedModel.id.value === event.nestedModelId.value) {
          return {
            ...nestedModel,
            name: event.newName,
          }
        } else {
          return nestedModel
        }
      }),
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
modelEventDescriptors.register(nestedModelRenamedDescriptor)
modelEventDescriptors.register(booleanPropertyChangeDescriptor)
modelEventDescriptors.register(modelSlotChangedDescriptor)

export const coreModelEvents = {
  modelRenamed,
  modelPluralRenamed,
  slotRenamed,
  slotChanged,
  nestedModelAdded,
  nestedModelRenamed,
  modelCreated,
  booleanPropertyChanged,
}
