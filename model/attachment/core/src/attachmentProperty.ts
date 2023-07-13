import { type Option, options } from '@cozemble/lang-util'
import {
  type Property,
  propertyIdFns,
  propertyNameFns,
  propertyTypeFns,
} from '@cozemble/model-core'


export const attachmentPropertyType = propertyTypeFns.newInstance('attachment.property')

export interface AttachmentPropertyConfiguration {
  minAttachments?: number | null
  maxAttachments?: number | null
  accept?: string | null
}

export interface AttachmentProperty extends Property, AttachmentPropertyConfiguration {
  propertyType: { _type: 'property.type'; value: 'attachment.property' }
}

export function emptyProperty(name: string): AttachmentProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', value: 'attachment.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
  }
}

// @ts-ignore
export type AttachmentPropertyOption = Option<AttachmentProperty>

function minAttachments(min: number | null): AttachmentPropertyOption {
  return (property: any) => {
    return {
      ...property,
      minAttachments: min,
    }
  }
}

function maxAttachments(max: number | null): AttachmentPropertyOption {
  return (property: any) => {
    return {
      ...property,
      maxAttachments: max,
    }
  }
}

function accept(accept: string | null): AttachmentPropertyOption {
  return (property: any) => {
    return {
      ...property,
      accept,
    }
  }
}

export const attachmentPropertyOptions = {
  minAttachments,
  maxAttachments,
  accept,
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
