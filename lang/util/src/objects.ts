// @ts-ignore
import mergician from 'mergician'

import { first, tail } from './arrays.js'

export function pick(obj: any, keys: string[]): any {
  return keys.reduce((previousValue: any, currentValue) => {
    previousValue[currentValue] = obj[currentValue]
    return previousValue
  }, {})
}

function walkToRecursive(obj: any, key: string | null, path: string[]): any | null {
  if (key === null) {
    return obj === undefined ? null : obj
  }
  if (obj === undefined || obj === null) {
    return null
  }
  return walkToRecursive(obj[key], first(path), tail(path))
}

export function walkTo(obj: any, ...path: string[]): any | null {
  return walkToRecursive(obj, first(path), tail(path))
}

export function dropKeysRecursive(obj: any, ...keysToDrop: string[]): any {
  if (Array.isArray(obj)) {
    return obj.map((o) => dropKeysRecursive(o, ...keysToDrop))
  }
  return JSON.parse(JSON.stringify(obj, (k, v) => (keysToDrop.includes(k) ? undefined : v)))
}

export function dropKeys(obj: any, ...keysToDrop: string[]): any {
  const keysToPick = Object.keys(obj).filter((key) => !keysToDrop.includes(key))
  return pick(obj, keysToPick)
}

export function mapKeys(obj: any, keyMapper: (key: string) => string): any {
  return Object.keys(obj).reduce((acc, currentKey) => {
    acc[keyMapper(currentKey)] = obj[currentKey]
    return acc
  }, <any>{})
}

export function mapValues(obj: any, valueMapper: (v: any) => any): any {
  return Object.keys(obj).reduce((acc, currentKey) => {
    acc[currentKey] = valueMapper(obj[currentKey])
    return acc
  }, <any>{})
}

export function sameJson(a: any, b: any): boolean {
  return JSON.stringify(orderKeys(a)) === JSON.stringify(orderKeys(b))
}

export function merge(a: any, b: any): any {
  return mergician(a, b)
}

export function containsObject(bigObject: any, smallObject: any): any {
  return Object.keys(smallObject).every((k) => bigObject[k] === smallObject[k])
}

export function set(obj: any, key: string, value: any): any {
  obj[key] = value
  return obj
}

export function typeAwareEqual(a: any, b: any): any {
  const typeOfA = typeof a
  const typeOfB = typeof b
  if (typeOfA !== typeOfB) {
    return false
  }
  if (typeOfA === 'object' && a.getTime) {
    return a.getTime() === b.getTime()
  }
  return a === b
}

export function orderKeys(unordered: any): any {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key]
      return obj
    }, <any>{})
}

export function keysAndValues(obj: any): { key: string; value: any }[] {
  const result = []
  for (const [key, value] of Object.entries(obj)) {
    // @ts-ignore
    result.push({ key, value })
  }
  return result
}
