import { type Option, options } from '@cozemble/lang-util'
import {
  type Property,
  propertyIdFns,
  propertyNameFns,
  propertyTypeFns,
} from '@cozemble/model-core'

export const attachmentPropertyType = propertyTypeFns.newInstance('attachment.property')

export interface AttachmentProperty extends Property {
  propertyType: { _type: 'property.type'; type: 'attachment.property' }
  minAttachments?: number | null
  maxAttachments?: number | null
}

export function emptyProperty(name: string): AttachmentProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', type: 'attachment.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
  }
}

export type AttachmentPropertyOption = Option<AttachmentProperty>

function minAttachments(min: number | null): AttachmentPropertyOption {
  return (property) => {
    return {
      ...property,
      minAttachments: min,
    }
  }
}

function maxAttachments(max: number | null): AttachmentPropertyOption {
  return (property) => {
    return {
      ...property,
      maxAttachments: max,
    }
  }
}

export const attachmentPropertyOptions = {
  minAttachments,
  maxAttachments,
}

export const attachmentPropertyFns = {
  applyOptions: (
    property: AttachmentProperty,
    ...opts: AttachmentPropertyOption[]
  ): AttachmentProperty => {
    return options.apply(property, ...opts)
  },
  newInstance: (nameAsStr: string, ...opts: AttachmentPropertyOption[]): AttachmentProperty => {
    const name = propertyNameFns.newInstance(nameAsStr)
    return attachmentPropertyFns.applyOptions({ ...emptyProperty(nameAsStr), name }, ...opts)
  },
}
