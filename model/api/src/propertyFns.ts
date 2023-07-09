import { options } from '@cozemble/lang-util'
import type { Property, PropertyName, PropertyOption } from '@cozemble/model-core'
import { jsonDataTypes, propertyIdFns, propertyNameFns, PropertyType } from '@cozemble/model-core'
import {
  arrayPropertyType,
  JsonArrayProperty,
  jsonStringPropertyFns,
  stringPropertyType,
} from '@cozemble/model-properties-core'

export const propertyFns = {
  newInstance(name = 'Untitled Property', ...opts: PropertyOption[]): Property {
    return options.apply(jsonStringPropertyFns.newInstance(name), ...opts)
  },
  newArray(
    name = 'Untitled Property',
    itemType: PropertyType = stringPropertyType,
  ): JsonArrayProperty {
    return {
      _type: 'property',
      id: propertyIdFns.newInstance(),
      name: propertyNameFns.newInstance(name),
      version: 0,
      required: false,
      unique: false,
      propertyType: arrayPropertyType,
      jsonType: jsonDataTypes.array,
      configuration: {
        _type: 'array.property.configuration',
        itemType: itemType.value,
      },
    }
  },
  rename(property: Property, newName: PropertyName | string): Property {
    return {
      ...property,
      name: typeof newName === 'string' ? propertyNameFns.newInstance(newName) : newName,
    }
  },
}

const required: PropertyOption = (property) => {
  return { ...property, required: true }
}

const unique: PropertyOption = (property) => {
  return { ...property, unique: true }
}

export const propertyOptions = {
  named(name: string | PropertyName): PropertyOption {
    return (property) => ({
      ...property,
      name: typeof name === 'string' ? propertyNameFns.newInstance(name) : name,
    })
  },
  required,
  unique,
}
