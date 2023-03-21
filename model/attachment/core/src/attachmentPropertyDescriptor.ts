import type { ModelId, PropertyDescriptor, PropertyId, PropertyName } from '@cozemble/model-core'
import { AttachmentProperty, attachmentPropertyType } from './attachmentProperty'
import { newAttachmentPropertyModelEvent } from './events'

function validateProperty(_property: AttachmentProperty): Map<string, string> {
  return new Map<string, string>()
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

export const referencePropertyDescriptor: PropertyDescriptor<AttachmentProperty, AttachmentList> = {
  _type: 'property.descriptor',
  propertyType: attachmentPropertyType,
  name: { _type: 'dotted.name', name: 'Attachment.Any' },
  isRequireable: true,
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
