import {
  type Model, ModelEvent,
  type ModelEventDescriptor,
  modelEventDescriptors,
  modelEventFns,
  type ModelId,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
} from '@cozemble/model-core'
import {
  AttachmentProperty,
  attachmentPropertyFns,
  attachmentPropertyOptions,
  emptyProperty,
} from './attachmentProperty.js'

type ModelEvent = typeof ModelEvent
type Model = typeof Model
type ModelId = typeof ModelId
type PropertyId = typeof PropertyId
type PropertyName = typeof PropertyName
type ModelEventDescriptor = typeof ModelEventDescriptor

export interface NewAttachmentPropertyModelEvent extends ModelEvent {
  _type: 'new.attachment.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newAttachmentPropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewAttachmentPropertyModelEvent {
  return {
    _type: 'new.attachment.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(propertyName.value),
  }
}

export const newAttachmentPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.attachment.property.model.event',
  applyEvent: (model: Model, event: NewAttachmentPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
    }
    if (model.slots.some((p: any) => p.id.value === event.propertyId.value && p._type === 'property')) {
      newProperty = { ...newProperty, id: event.propertyId }
      return {
        ...model,
        slots: model.slots.map((p: any) => (p.id.value === event.propertyId.value ? newProperty : p)),
      }
    }
    return { ...model, slots: [...model.slots, newProperty] }
  },
}

export interface AttachmentModelChangedModelEvent extends ModelEvent {
  _type: 'attachment.model.changed.model.event'
  propertyId: PropertyId
  minAttachments: number | null
  maxAttachments: number | null
  accept: string | null
}

export function attachmentModelChangedModelEvent(
  modelId: ModelId,
  propertyId: PropertyId,
  minAttachments: number | null,
  maxAttachments: number | null,
  accept: string | null,
): AttachmentModelChangedModelEvent {
  return {
    _type: 'attachment.model.changed.model.event',
    ...modelEventFns.coreParts(modelId),

    propertyId,
    minAttachments,
    maxAttachments,
    accept,
  }
}

export const attachmentModelChangedModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'attachment.model.changed.model.event',
  applyEvent: (model: Model, event: AttachmentModelChangedModelEvent): Model => {
    return {
      ...model,
      slots: model.slots.map((p: any) => {
        if (p.id.value === event.propertyId.value && p._type === 'property') {
          if (p.propertyType.value !== 'attachment.property') {
            throw new Error(`Property ${p.id.value} is not a attachment property`)
          }
          return attachmentPropertyFns.applyOptions(
            p as AttachmentProperty,
            attachmentPropertyOptions.maxAttachments(event.maxAttachments),
            attachmentPropertyOptions.minAttachments(event.minAttachments),
            attachmentPropertyOptions.accept(event.accept),
          )
        }
        return p
      }),
    }
  },
}

export function registerModelEvents() {
  modelEventDescriptors.register(newAttachmentPropertyModelEventDescriptor)
  modelEventDescriptors.register(attachmentModelChangedModelEventDescriptor)
}
