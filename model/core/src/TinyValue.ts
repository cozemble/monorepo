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

export const tinyValueFns = {
  id: (value: string = uuids.v4()): Id => ({ _type: 'id', value }),
  name: (value: string): Name => ({ _type: 'name', value }),
}
