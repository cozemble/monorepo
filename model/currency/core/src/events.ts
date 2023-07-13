import {
  Model,
  ModelEvent,
  ModelEventDescriptor,
  ModelId,
  PropertyId,
  modelEventFns,
} from '@cozemble/model-core'

export interface CurrencyModelChangedModelEvent extends ModelEvent {
  _type: 'currency.model.changed.model.event'
  propertyId: PropertyId
  currency: string
  locale: string
  format: string | null
}

export function currencyModelChangedModelEvent(
  modelId: ModelId,
  propertyId: PropertyId,
  currency: string,
  locale: string,
  format: string | null,
): CurrencyModelChangedModelEvent {
  return {
    _type: 'currency.model.changed.model.event',
    ...modelEventFns.coreParts(modelId),

    propertyId,
    currency,
    locale,
    format,
  }
}

// @ts-ignore
export const currencyModelChangedModelEventDescriptor: ModelEventDescriptor<CurrencyModelChangedModelEvent> =
  {
    _type: 'model.event.descriptor',
    modelEventType: 'currency.model.changed.model.event',
    applyEvent: function (model: Model, event: CurrencyModelChangedModelEvent): Model {
      return {
        ...model,
        slots: model.slots.map((property: any) => {
          if (property.id.value === event.propertyId.value && property._type === 'property') {
            return {
              ...property,
              currency: event.currency,
              locale: event.locale,
              format: event.format,
            }
          } else {
            return property
          }
        }),
      }
    },
  }
