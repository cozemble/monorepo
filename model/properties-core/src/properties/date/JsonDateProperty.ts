import type { JsonSchema, SystemConfiguration } from '@cozemble/model-core'
import { jsonPropertyDescriptorFns, propertyDescriptors } from '@cozemble/model-core'
import { format } from 'date-fns'
import { makeDerivedStringProperty } from '../derived/makeDerivedProperty'

const defaultDateFormat = 'yyyy-MM-dd'

const datePropertySystemConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/schemas/property/json/number',
  type: 'object',
  properties: {
    dateFormat: {
      type: 'string',
      enum: ['YYYY-MM-DD', 'DD-MM-YYYY', 'YYYY/MM/DD', 'DD/MM/YYYY'],
    },
  },
}

const propertyType = 'json.date.property'

function systemConfigurationDateFormat(systemConfiguration: SystemConfiguration): string {
  return (
    systemConfiguration.slotConfiguration[propertyType]?.configuration?.dateFormat ??
    defaultDateFormat
  )
}

function formatDate(systemConfiguration: SystemConfiguration, date: Date): string {
  return format(date, systemConfigurationDateFormat(systemConfiguration))
}

export const jsonDatePropertyDescriptor = jsonPropertyDescriptorFns.withSystemConfigurationSchema(
  makeDerivedStringProperty('Date', propertyType, {}, (systemConfiguration) =>
    formatDate(systemConfiguration, new Date()),
  ),
  datePropertySystemConfigurationSchema,
)

export function registerJsonDateProperty() {
  propertyDescriptors.register(jsonDatePropertyDescriptor)
}
