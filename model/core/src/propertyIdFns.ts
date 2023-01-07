import { uuids } from '@cozemble/lang-util'
import { PropertyId } from './core'

export const propertyIdFns = {
  newInstance(id: string = uuids.v4()): PropertyId {
    return {
      _type: 'property.id',
      id,
    }
  },
  equals(a: PropertyId, b: PropertyId): boolean {
    return a.id === b.id
  },
}
