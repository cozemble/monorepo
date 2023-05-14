import { uuids } from '@cozemble/lang-util'

export interface TinyValue<T = string> {
  value: T
}

export interface Id extends TinyValue {
  _type: 'id'
}

export interface Name extends TinyValue {
  _type: 'name'
}

export const IdFns = {
  newId: (value = uuids.v4()): Id => ({ _type: 'id', value }),
}

export const NameFns = {
  newName: (value = 'Un-named'): Name => ({ _type: 'name', value }),
}
