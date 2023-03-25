import { type Option, options } from '@cozemble/lang-util'
import {
  ModelId,
  type Property,
  propertyIdFns,
  propertyNameFns,
  propertyTypeFns,
} from '@cozemble/model-core'

export const referencePropertyType = propertyTypeFns.newInstance('reference.property')

export interface ReferenceProperty extends Property {
  propertyType: { _type: 'property.type'; type: 'reference.property' }
  referencedModels: ModelId[]
  cardinality: 'one' | 'many'
}

export function emptyProperty(name: string): ReferenceProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', type: 'reference.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
    referencedModels: [],
    cardinality: 'one',
  }
}

export type ReferencePropertyOption = Option<ReferenceProperty>

function referencing(modelId: ModelId | null): ReferencePropertyOption {
  return (property) => {
    if (modelId === null) {
      return { ...property, referencedModels: [] }
    }
    if (property.cardinality === 'one') {
      return { ...property, referencedModels: [modelId] }
    }
    if (!property.referencedModels.some((id) => id.value === modelId.value)) {
      return { ...property, referencedModels: [...property.referencedModels, modelId] }
    }
    return property
  }
}

function dropReference(modelId: ModelId): ReferencePropertyOption {
  return (property) => {
    return {
      ...property,
      referencedModels: property.referencedModels.filter((id) => id.value !== modelId.value),
    }
  }
}

function cardinality(cardinality: 'one' | 'many'): ReferencePropertyOption {
  return (property) => {
    if (cardinality === 'one' && property.referencedModels.length > 1) {
      throw new Error('Cannot change cardinality to one when there are multiple referenced models')
    }
    return { ...property, cardinality }
  }
}

export const referencePropertyOptions = {
  referencing,
  dropReference,
  cardinality,
}

export const referencePropertyFns = {
  applyOptions: (
    property: ReferenceProperty,
    ...opts: ReferencePropertyOption[]
  ): ReferenceProperty => {
    return options.apply(property, ...opts)
  },
  newInstance: (nameAsStr: string, ...opts: ReferencePropertyOption[]): ReferenceProperty => {
    const name = propertyNameFns.newInstance(nameAsStr)
    return referencePropertyFns.applyOptions({ ...emptyProperty(nameAsStr), name }, ...opts)
  },
  oneReference: (p: ReferenceProperty): ModelId | null => {
    if (p.cardinality !== 'one') {
      throw new Error('Cannot get one reference from many reference')
    }
    return p.referencedModels[0] ?? null
  },
}
