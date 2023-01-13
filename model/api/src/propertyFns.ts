import { options } from '@cozemble/lang-util'
import type { Property, PropertyName, PropertyOption } from '@cozemble/model-core'
import { propertyNameFns } from '@cozemble/model-core'
import { stringPropertyFns } from '@cozemble/model-string-core'

export const propertyFns = {
  newInstance(name = 'Untitled Property', ...opts: PropertyOption[]): Property {
    return options.apply(stringPropertyFns.newInstance(name), ...opts)
  },
  rename(property: Property, newName: PropertyName | string): Property {
    return {
      ...property,
      name: typeof newName === 'string' ? propertyNameFns.newInstance(newName) : newName,
    }
  },
}

export const propertyOptions = {
  named(name: string | PropertyName): PropertyOption {
    return (property) => ({
      ...property,
      name: typeof name === 'string' ? propertyNameFns.newInstance(name) : name,
    })
  },
}
