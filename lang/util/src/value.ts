export interface Value<T> {
  _type: 'value'
  value: T
}

export function value<T>(value: T): Value<T> {
  return { _type: 'value', value }
}
