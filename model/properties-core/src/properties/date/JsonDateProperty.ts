import type { JsonSchema, SystemConfiguration } from '@cozemble/model-core'
import {
  DataRecord,
  JsonProperty,
  jsonPropertyDescriptorFns,
  propertyDescriptors,
} from '@cozemble/model-core'
import { format, parse } from 'date-fns'
import { makeDerivedStringProperty } from '../derived/makeDerivedProperty.js'
import { errors } from '@cozemble/lang-util'

const defaultDateFormat = 'yyyy-MM-dd'

const datePropertySystemConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/schemas/property/json/number',
  type: 'object',
  properties: {
    dateFormat: {
      type: 'string',
      default: defaultDateFormat,
    },
  },
}

const propertyType = 'json.date.property'

function systemConfigurationDateFormat(systemConfiguration: SystemConfiguration): string {
  return (systemConfiguration as any)[propertyType]?.dateFormat ?? defaultDateFormat
}

function formatDate(systemConfiguration: SystemConfiguration, date: Date): string {
  return format(date, systemConfigurationDateFormat(systemConfiguration))
}

export const jsonDatePropertyDescriptor = {
  ...jsonPropertyDescriptorFns.withSystemConfigurationSchema(
    makeDerivedStringProperty('Date', propertyType, {}, (systemConfiguration) =>
      formatDate(systemConfiguration, new Date()),
    ),
    datePropertySystemConfigurationSchema,
  ),
  getValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonProperty,
    record: DataRecord,
  ) => {
    const value = record.values[property.id.value] ?? null
    if (value === null || value === undefined || value === '') {
      return null
    }
    try {
      const parsed = parse(value, defaultDateFormat, new Date())
      return formatDate(systemConfiguration, parsed)
    } catch (e: any) {
      throw errors.prependToMessage(e, `Failed to format as date: ${value}`)
    }
  },
  configurationSchema: null,
}

export function registerJsonDateProperty() {
  propertyDescriptors.register(jsonDatePropertyDescriptor)
}

export const datePropertyType = jsonDatePropertyDescriptor.propertyType
