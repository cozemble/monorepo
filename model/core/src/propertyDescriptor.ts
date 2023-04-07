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
import { SystemConfiguration } from './systemConfiguration'

/**
 * This is the interface that all property descriptors must implement, and is the means of adding properties
 * to cozemble.  It takes two generics: P is the type of the property, and V is the type of the value.  For example
 * a string property descriptor should have a P of StringProperty and a V of string | null.
 *
 * The propertyType is the type of the property, and is used to identify the property descriptor.  It is the key in the
 * propertyDescriptors map.
 *
 * The name is the name of the property, and is used to identify the property in the UI.  You can use dots in the name
 * to represent the menu hierarchy in the UI.  For example, Attachment.Image and Attachment.Video would be two properties
 * that would be grouped under the Attachment menu item.
 *
 * The isRequireable and isUniqueable flags are used to determine if the property can be configured as required or unique
 * by the user adding the property to a model.  For example, a string could be unique, but an image could not.
 *
 * Because model edits in cozemble are event source, and we need to be able to create new properties, the newProperty
 * function must emit an event.  This event should encapsulate the creation of an instance of this property type.  In a separate part
 * of the process, we will define the contents of that event, and register a handler for that event into the system.
 *
 * The validateProperty function is used to validate the configuration of the property itself, as it is being added to a model.  This is distinct from validation
 * of a piece of data that is to be stored against this property.  For example, a string property might have a regex validation that you can configure when defining
 * a string property for a model.  But the regex has to be properly formed, so this function is where you validate that.  This function is basically saying
 * "has the user configured the property correctly?".
 *
 * The randomValue function is used to generate a random data value for this property.  This is used when generating random data for a model.
 *
 * The validateValue function is used to validate a value that is to be stored against this property.  This is used when validating data that is being stored
 * in the database.  This function is basically saying "is the data that the user is trying to store against this property valid?".
 *
 * The setValue function is used to set a value against a property in a record.  This is used when storing data in the database.
 *
 * The getValue function is used to get a value from a property in a record.  This is used when retrieving data from the database.
 */
export interface PropertyDescriptor<P = any, V = any> {
  _type: 'property.descriptor'
  propertyType: PropertyType
  name: DottedName
  isRequireable: boolean
  isUniqueable: boolean
  newProperty: (
    systemConfiguration: SystemConfiguration,
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ) => ModelEvent

  validateProperty(property: P): Map<string, string>

  randomValue: (systemConfiguration: SystemConfiguration) => V
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: P,
    value: V | null,
  ) => string[]

  setValue(
    systemConfiguration: SystemConfiguration,
    property: P,
    record: DataRecord,
    value: V | null,
  ): DataRecord

  getValue(systemConfiguration: SystemConfiguration, property: P, record: DataRecord): V | null
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
        propertyType.value
      }, available types are ${registeredProperties.map((rp) => rp.propertyType.value).join(', ')}`,
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
