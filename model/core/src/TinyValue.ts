import { uuids } from '@cozemble/lang-util'

export interface TinyValue<T = string, V = string> {
  _type: T
  value: V
}

export type Id = TinyValue<'id'>
export type Name = TinyValue<'name'>

export const tinyValueFns = {
  id: (value: string = uuids.v4()): Id => ({ _type: 'id', value }),
  name: (value: string): Name => ({ _type: 'name', value }),
  equals(a: TinyValue, b: TinyValue): boolean {
    return a.value === b.value && a._type === b._type
  },
}
