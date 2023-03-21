import type { ModelId, PropertyDescriptor, PropertyId, PropertyName } from '@cozemble/model-core'
import { AttachmentProperty, attachmentPropertyType } from './attachmentProperty'
import { newAttachmentPropertyModelEvent } from './events'

function validateProperty(property: AttachmentProperty): Map<string, string> {
  const errors = new Map<string, string>()
  if (property.maxAttachments === 0) {
    errors.set(`maxAttachments`, 'Should not be 0, use -1 for unlimited')
  }
  const max = property.maxAttachments ?? -1
  const min = property.minAttachments ?? 0
  if (max !== -1 && min > max) {
    errors.set(`minAttachments`, 'Should not be greater than max')
  }
  return errors
}

export interface Size {
  width: number
  height: number
}

export interface AttachmentReference {
  _type: 'attachment.reference'
  attachmentId: string
  fileName: string
  contentType: string
  sizeInBytes: number
  size: Size | null
  thumbnailUrl: string | null
}

export interface AttachmentList {
  _type: 'attachment.list'
  attachmentReferences: AttachmentReference[]
}

export const attachmentPropertyDescriptor: PropertyDescriptor<AttachmentProperty, AttachmentList> =
  {
    _type: 'property.descriptor',
    propertyType: attachmentPropertyType,
    name: { _type: 'dotted.name', name: 'Attachment.Any' },
    isRequireable: false,
    isUniqueable: false,
    validateProperty,
    randomValue: (): AttachmentList => {
      return { _type: 'attachment.list', attachmentReferences: [] }
    },
    validateValue: (property: AttachmentProperty, value: AttachmentList | null): string[] => {
      const references = value?.attachmentReferences ?? []
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
      newAttachmentPropertyModelEvent(modelId, propertyName, propertyId),
  }
