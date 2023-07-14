export interface Value<T = any> {
  _type: 'value'
  value: T
}

export function value<T = any>(value: T): Value<T> {
  return { _type: 'value', value }
}
