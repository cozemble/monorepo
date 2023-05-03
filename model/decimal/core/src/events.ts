import {
  ModelEvent,
  ModelEventDescriptor,
  ModelId,
  PropertyId,
  modelEventDescriptors,
  modelEventFns,
} from '@cozemble/model-core'

export interface NumberOfDecimalPlacesChanged extends ModelEvent {
  _type: 'decimal.property.numberOfPlacesChanged.event'
  propertyId: PropertyId
  newValue: number
}

export function numberOfDecimalPlacesChanged(
  modelId: ModelId,
  propertyId: PropertyId,
  newValue: number,
): NumberOfDecimalPlacesChanged {
  return {
    _type: 'decimal.property.numberOfPlacesChanged.event',
    ...modelEventFns.coreParts(modelId),
    propertyId,
    newValue,
  }
}

export const numberOfDecimalPlacesChangeDescriptor: ModelEventDescriptor<NumberOfDecimalPlacesChanged> =
  {
    _type: 'model.event.descriptor',
    modelEventType: 'decimal.property.numberOfPlacesChanged.event',
    applyEvent: (model, event) => {
      return {
        ...model,
        slots: model.slots.map((property) => {
          if (property.id.value === event.propertyId.value && property._type === 'property') {
            return {
              ...property,
              numberOfDecimalPlaces: event.newValue,
            }
          } else {
            return property
          }
        }),
      }
    },
  }
