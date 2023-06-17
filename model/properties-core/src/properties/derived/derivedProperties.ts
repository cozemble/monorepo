import { jsonSchemaFns, propertyDescriptors } from '@cozemble/model-core'
import { makeDerivedNumberProperty, makeDerivedStringProperty } from './makeDerivedProperty'
import { StringPropertyConfiguration } from '../string/JsonStringProperty'
import {
  NumberPropertyConfiguration,
  numberPropertyConfigurationSchema,
} from '../number/JsonNumberProperty'

const phoneNumberConfiguration: StringPropertyConfiguration = {
  _type: 'string.property.configuration',
  pattern: '^\\+?[\\d\\s\\-\\(\\)]{7,20}$',
  patternExplanation: 'Must be a valid phone number',
  multipleLines: false,
  prefix: '',
  suffix: '',
}

const phoneNumberPropertyDescriptor = makeDerivedStringProperty(
  'Phone number',
  'json.phoneNumber.property',
  phoneNumberConfiguration,
  [
    '+1 212 555 1234', // International format (US)
    '(212) 555-1234', // Local format (US)
    '+1 416 555 5678', // International format (Canada)
    '(416) 555-5678', // Local format (Canada)
    '+44 20 7123 4567', // International format (UK)
    '020 7123 4567', // Local format (UK)
    '+61 2 9876 5432', // International format (Australia)
    '(02) 9876 5432', // Local format (Australia)
    '+49 30 1234 5678', // International format (Germany)
    '030 12345678', // Local format (Germany)
    '+55 11 91234 5678', // International format (Brazil)
    '(11) 91234-5678', // Local format (Brazil)
    '+91 22 2345 6789', // International format (India)
    '022 2345 6789', // Local format (India)
    '+81 3 1234 5678', // International format (Japan)
    '03-1234-5678', // Local format (Japan)
    '+27 11 123 4567', // International format (South Africa)
    '011 123 4567', // Local format (South Africa)
    '+54 11 4123 4567', // International format (Argentina)
    '011 4123-4567', // Local format (Argentina)
  ],
  null,
)

const integerConfiguration: NumberPropertyConfiguration = {
  _type: 'number.property.configuration',
  decimalPlaces: 0,
}

const integerPropertyDescriptor = makeDerivedNumberProperty(
  'Integer',
  'json.integer.property',
  integerConfiguration,
  [123, 0, -123, 1234567890, -1234567890],
  jsonSchemaFns.dropProperty(numberPropertyConfigurationSchema, 'decimalPlaces'),
)

export function registerDerivedProperties() {
  propertyDescriptors.register(phoneNumberPropertyDescriptor)
  propertyDescriptors.register(integerPropertyDescriptor)
}
