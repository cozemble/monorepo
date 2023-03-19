import type { ModelId, PropertyDescriptor, PropertyId, PropertyName } from '@cozemble/model-core'
import { DataRecordId } from '@cozemble/model-core'
import { type ReferenceProperty, referencePropertyType } from './referenceProperty'
import { newReferencePropertyModelEvent } from './events'

function validateProperty(property: ReferenceProperty): Map<string, string> {
  const errors = new Map<string, string>()
  if (property.referencedModels.length === 0) {
    errors.set(`referencedModels`, 'Required')
  }
  return errors
}

export interface ReferencedRecords {
  _type: 'referenced.records'
  recordIds: DataRecordId[]
}

export const referencePropertyDescriptor: PropertyDescriptor<ReferenceProperty, ReferencedRecords> =
  {
    _type: 'property.descriptor',
    propertyType: referencePropertyType,
    name: { _type: 'dotted.name', name: 'Reference.Another Record' },
    isRequireable: true,
    isUniqueable: false,
    validateProperty,
    randomValue: (): ReferencedRecords => {
      return { _type: 'referenced.records', recordIds: [] }
    },
    validateValue: (property: ReferenceProperty, value: ReferencedRecords | null): string[] => {
      const references = value?.recordIds ?? []
      console.log({ property, value, references })
      if (references.length === 0) {
        return ['Required']
      }
      return []
    },
    setValue: (property, record, value) => {
      return {
        ...record,
        values: {
          ...record.values,
          [property.id.value]: value,
        },
      }
    },
    getValue: (property, record) => {
      return record.values[property.id.value] ?? null
    },
    newProperty: (modelId: ModelId, propertyName: PropertyName, propertyId?: PropertyId) =>
      newReferencePropertyModelEvent(modelId, propertyName, propertyId),
  }
