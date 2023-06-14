import {
  type JsonStringProperty,
  jsonStringPropertyDescriptor,
} from '$lib/properties/JsonStringProperty'
import type { NewJsonPropertyModelEvent } from '$lib/properties/events'
import type { PropertyDescriptor, PropertyType } from '@cozemble/model-core'
import {
  dottedNameFns,
  jsonDataTypes,
  modelEventFns,
  type ModelId,
  propertyDescriptors,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
  type SystemConfiguration,
} from '@cozemble/model-core'

const phoneNumberConfiguration = {
  pattern: '^\\+?[\\d\\s\\-\\(\\)]{7,20}$',
  patternExplanation: 'Must be a valid phone number',
  multipleLines: false,
  prefix: '',
  suffix: '',
}

const jsonPhoneNumberPropertyType: PropertyType = {
  _type: 'property.type',
  value: 'json.phoneNumber.property',
}

export const phoneNumberPropertyDescriptor: PropertyDescriptor<JsonStringProperty, string> = {
  ...jsonStringPropertyDescriptor,
  propertyType: jsonPhoneNumberPropertyType,
  name: dottedNameFns.newInstance('Phone number'),
  randomValue: (): string => {
    return '0412345678'
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
      propertyType: jsonPhoneNumberPropertyType,
      jsonType: jsonDataTypes.string,
      propertyId: propertyId ?? propertyIdFns.newInstance(),
      configuration: phoneNumberConfiguration,
    }
  },
}

export function registerDerivedProperties() {
  propertyDescriptors.register(phoneNumberPropertyDescriptor)
}
