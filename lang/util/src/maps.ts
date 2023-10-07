import type { StringKeyedObject } from './index.ts'

export function mapOf(...pairs: any[]): Map<any, any> {
  const map = new Map()
  for (let i = 0; i < pairs.length; i = i + 2) {
    map.set(pairs[i], pairs[i + 1])
  }
  return map
}

export function toObject<K>(m: Map<K, any>, keyGetter: (k: K) => string): StringKeyedObject {
  const result = {} as StringKeyedObject
  for (const key of m.keys()) {
    const stringKey = keyGetter(key)
    result[stringKey] = m.get(key)
  }
  return result
}
