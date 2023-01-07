import { options } from '@cozemble/lang-util'
import { Property, PropertyName, propertyNameFns, PropertyOption } from '@cozemble/model-core'
import { stringPropertyFns } from '@cozemble/model-string-core'

export const propertyFns = {
  newInstance(...opts: PropertyOption[]): Property {
    return options.apply(stringPropertyFns.newInstance('Untitled property'), ...opts)
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
