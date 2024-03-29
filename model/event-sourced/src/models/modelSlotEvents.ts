import {
  Model,
  ModelEvent,
  ModelEventDescriptor,
  modelEventDescriptors,
  modelEventFns,
  ModelId,
  modelReferenceFns,
  ModelReferenceId,
  ModelReferenceName,
} from '@cozemble/model-core'

interface NewModelReference extends ModelEvent {
  _type: 'new.model.reference.event'
  originModelId: ModelId
  modelReferenceName: ModelReferenceName
  modelReferenceId: ModelReferenceId
}

function newModelReference(
  modelId: ModelId,
  modelReferenceName: ModelReferenceName,
  modelReferenceId: ModelReferenceId,
): NewModelReference {
  return {
    _type: 'new.model.reference.event',
    ...modelEventFns.coreParts(modelId),
    originModelId: modelId,
    modelReferenceName,
    modelReferenceId,
  }
}

function replaceSlotWithModelReference(model: Model, event: NewModelReference) {
  return {
    ...model,
    slots: model.slots.map((s) => {
      if (s.id.value === event.modelReferenceId.value) {
        return modelReferenceFns.newInstance(
          event.originModelId,
          [],
          event.modelReferenceName,
          false,
          event.modelReferenceId,
        )
      }
      return s
    }),
  }
}

function addModelReferenceSlot(model: Model, event: NewModelReference) {
  return {
    ...model,
    slots: [
      ...model.slots,
      modelReferenceFns.newInstance(
        event.originModelId,
        [],
        event.modelReferenceName,
        false,
        event.modelReferenceId,
      ),
    ],
  }
}

const newModelReferenceDescriptor: ModelEventDescriptor<NewModelReference> = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.model.reference.event',
  applyEvent: (model, event) => {
    if (model.slots.some((s) => s.id.value === event.modelReferenceId.value)) {
      return replaceSlotWithModelReference(model, event)
    }
    return addModelReferenceSlot(model, event)
  },
}

interface ModelReferenceChanged extends ModelEvent {
  _type: 'model.reference.changed.event'
  modelReferenceId: ModelReferenceId
  referencedModelId: ModelId | null
}

function modelReferenceChanged(
  modelId: ModelId,
  modelReferenceId: ModelReferenceId,
  referencedModelId: ModelId | null,
): ModelReferenceChanged {
  return {
    _type: 'model.reference.changed.event',
    ...modelEventFns.coreParts(modelId),
    modelReferenceId,
    referencedModelId,
  }
}

const modelReferenceChangedDescriptor: ModelEventDescriptor<ModelReferenceChanged> = {
  _type: 'model.event.descriptor',
  modelEventType: 'model.reference.changed.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      slots: model.slots.map((s) => {
        if (s.id.value === event.modelReferenceId.value) {
          if (s._type !== 'model.reference') {
            throw new Error(`Slot ${event.modelReferenceId.value} is not a model reference`)
          }
          if (event.referencedModelId === null) {
            return {
              ...s,
              referencedModels: [],
            }
          }
          return {
            ...s,
            referencedModels: [event.referencedModelId],
          }
        }
        return s
      }),
    }
  },
}

modelEventDescriptors.register(newModelReferenceDescriptor)
modelEventDescriptors.register(modelReferenceChangedDescriptor)

export const modelSlotEvents = {
  newModelReference,
  // modelReferenceChanged,
}
