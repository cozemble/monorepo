import { uuids } from '@cozemble/lang-util'
import { PropertyId } from './core'

export const propertyIdFns = {
  newInstance(value: string = uuids.v4()): PropertyId {
    return {
      _type: 'property.id',
      value,
    }
  },
  equals(a: PropertyId, b: PropertyId): boolean {
    return a.value === b.value
  },
}
