import { mandatory } from '@cozemble/lang-util'
import {
  DataRecord,
  DottedName,
  ModelId,
  Property,
  PropertyId,
  PropertyName,
  PropertyType,
  propertyTypeFns,
} from './core'
import { ModelEvent } from './events'

export interface PropertyDescriptor<P = any, V = any> {
  _type: 'property.descriptor'
  propertyType: PropertyType
  name: DottedName
  newProperty: (modelId: ModelId, propertyName: PropertyName, propertyId?: PropertyId) => ModelEvent

  validateProperty(property: P): Map<string, string>

  randomValue: () => V

  validateValue: (property: P, value: V | null) => string[]

  setValue(property: P, record: DataRecord, value: V | null): DataRecord

  getValue(property: P, record: DataRecord): V | null
}

const registeredProperties: PropertyDescriptor[] = []
let defaultPropertyDescriptor: PropertyDescriptor | null = null

export const propertyDescriptors = {
  register: (descriptor: PropertyDescriptor) => {
    if (
      !registeredProperties.find((p) =>
        propertyTypeFns.equals(p.propertyType, descriptor.propertyType),
      )
    ) {
      registeredProperties.push(descriptor)
    }
  },
  get: (propertyType: PropertyType): PropertyDescriptor | null => {
    return (
      registeredProperties.find((p) => propertyTypeFns.equals(p.propertyType, propertyType)) ?? null
    )
  },
  mandatory: (p: Property | PropertyType): PropertyDescriptor => {
    const propertyType = p._type === 'property' ? p.propertyType : p
    return mandatory(
      registeredProperties.find((p) => propertyTypeFns.equals(p.propertyType, propertyType)),
      `No property descriptor registered for property type ${
        propertyType.type
      }, available types are ${registeredProperties.map((rp) => rp.propertyType.type).join(', ')}`,
    )
  },
  list: () => {
    return registeredProperties
  },
  getDefault(): PropertyDescriptor {
    return mandatory(defaultPropertyDescriptor, 'No default property descriptor registered')
  },
  setDefault(descriptor: PropertyDescriptor) {
    defaultPropertyDescriptor = descriptor
  },
}
