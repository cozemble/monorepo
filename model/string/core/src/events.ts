import {
  type Model,
  type ModelEvent,
  type ModelEventDescriptor,
  modelEventDescriptors,
  modelEventFns,
  type ModelId,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
} from '@cozemble/model-core'
import { emptyProperty } from './stringProperty'

/** Step 1. Define an event type to represent the creation of a new string property.
 *  It needs to contain in it all that is needed to create a new string property.
 *  So far, and this is only after three property types, it seems that the only
 *  thing that is needed is the property name and the property id.
 *
 *  The distinct _type property is needed to distinguish this event from other
 *  property creation events (like the one for attachments), so the right handler is called
 *  and the right property is created.
 */
export interface NewStringPropertyModelEvent extends ModelEvent {
  _type: 'new.string.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

/** Step 2. Not essential, more a coding convention, but it is nice to have a function
 * that creates the event.
 */
export function newStringPropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewStringPropertyModelEvent {
  return {
    _type: 'new.string.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(propertyName.value),
  }
}

/**
 * Step 3. Just like PropertyDescriptors descript properties and enable them to be registered
 * with the cozemble runtime, ModelEventDescriptors describe model events and enable them to be
 * registered with the cozemble runtime.
 *
 * The modelEventType property must be the same as the _type property of the event type.  In this case, we can see
 * that this is intended to be the handler for the NewStringPropertyModelEvent type (its value is new.string.property.model.event which is the
 * _type of NewStringPropertyModelEvent).
 *
 * The applyEvent function is the function that is called when the event is applied to a model.  It is passed the model and the event, and it must create
 * the right property, and add it to the list of properties in the model.  One detail to note, is that if the user configuring this property
 * changed the property type in the UI from something else to this property, then there will already be a property  in the model with the given
 * property id, and we need to replace it.  Other-wise we add it to the model as a new property.
 */
export const newStringPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.string.property.model.event',
  applyEvent: (model: Model, event: NewStringPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
    }
    if (model.slots.some((p) => p.id.value === event.propertyId.value)) {
      newProperty = { ...newProperty, id: event.propertyId }
      return {
        ...model,
        slots: model.slots.map((p) => (p.id.value === event.propertyId.value ? newProperty : p)),
      }
    }
    return { ...model, slots: [...model.slots, newProperty] }
  },
}

export interface StringMultilineChanged extends ModelEvent {
  _type: 'string.property.multiline.event'
  propertyId: PropertyId
  newValue: boolean
}

export function stringMultilineChanged(
  modelId: ModelId,
  propertyId: PropertyId,
  newValue: boolean,
): StringMultilineChanged {
  return {
    _type: 'string.property.multiline.event',
    ...modelEventFns.coreParts(modelId),
    propertyId,
    newValue,
  }
}

const stringMultilineChangeDescriptor: ModelEventDescriptor<StringMultilineChanged> = {
  _type: 'model.event.descriptor',
  modelEventType: 'string.property.multiline.event',
  applyEvent: (model, event) => {
    return {
      ...model,
      slots: model.slots.map((property) => {
        if (property.id.value === event.propertyId.value && property._type === 'property') {
          return {
            ...property,
            multiline: event.newValue,
          }
        } else {
          return property
        }
      }),
    }
  },
}

/**
 * Step 4. Create a function to register the event descriptor with the cozemble runtime.
 */
export function registerModelEvents() {
  modelEventDescriptors.register(newStringPropertyModelEventDescriptor)
  modelEventDescriptors.register(stringMultilineChangeDescriptor)
}
