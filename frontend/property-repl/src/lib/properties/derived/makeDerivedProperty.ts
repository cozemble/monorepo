import type { JsonStringProperty } from '$lib/properties/string/JsonStringProperty'
import { jsonStringPropertyDescriptor } from '$lib/properties/string/JsonStringProperty'
import type { NewJsonPropertyModelEvent } from '$lib/properties/events'
import type {
  ModelId,
  PropertyDescriptor,
  PropertyId,
  PropertyName,
  PropertyType,
  SystemConfiguration,
} from '@cozemble/model-core'
import { dottedNameFns, jsonDataTypes, modelEventFns, propertyIdFns } from '@cozemble/model-core'
import { random } from '@cozemble/lang-util'

export function makeDerivedStringProperty(
  name: string,
  type: string,
  configuration: any,
  exampleProvider: string[] | ((systemConfiguration: SystemConfiguration) => string),
): PropertyDescriptor<JsonStringProperty, string> {
  const thisPropertyTyoe: PropertyType = {
    _type: 'property.type',
    value: type,
  }

  return {
    ...jsonStringPropertyDescriptor,
    propertyType: thisPropertyTyoe,
    name: dottedNameFns.newInstance(name),
    randomValue: (systemConfiguration: SystemConfiguration): string => {
      if (typeof exampleProvider === 'function') {
        return exampleProvider(systemConfiguration)
      }
      return random.elementOfArray(exampleProvider)
    },
    newProperty: (
      systemConfiguration: SystemConfiguration,
      modelId: ModelId,
      propertyName: PropertyName,
      propertyId?: PropertyId,
    ): NewJsonPropertyModelEvent => {
      return {
        _type: 'new.json.property.model.event',
        ...modelEventFns.coreParts(modelId),
        propertyName,
        propertyType: thisPropertyTyoe,
        jsonType: jsonDataTypes.string,
        propertyId: propertyId ?? propertyIdFns.newInstance(),
        configuration: configuration,
      }
    },
  }
}
