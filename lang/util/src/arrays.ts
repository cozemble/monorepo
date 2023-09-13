export function secondLast(arr: any[]): any {
  return arr[arr.length - 2]
}

export function isSubset(smaller: any[], larger: any[]): boolean {
  return smaller.every((i) => larger.includes(i))
}

export function startsWith(master: any[], start: any[]) {
  for (let i = 0; i < start.length; i++) {
    if (master[i] !== start[i]) {
      return false
    }
  }
  return true
}

export function toMap<T>(array: T[], keyProducer: (t: T) => string): { [key: string]: T } {
  return array.reduce((accumulator: { [key: string]: T }, currentValue) => {
    accumulator[keyProducer(currentValue)] = currentValue
    return accumulator
  }, {})
}

export function moveItem(array: any[], fromIndex: number, toIndex: number): any[] {
  if (fromIndex === toIndex) return array

  const newArray = [...array]

  const target = newArray[fromIndex]
  const inc = toIndex < fromIndex ? -1 : 1

  for (let i = fromIndex; i !== toIndex; i += inc) {
    newArray[i] = newArray[i + inc]
  }

  newArray[toIndex] = target

  return newArray
}

export function removeItemAtIndex<T>(arr: Array<T>, index: number): Array<T> {
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

export function unique<T>(array: T[]): T[] {
  function onlyUnique(value: any, index: any, self: any) {
    return self.indexOf(value) === index
  }

  return array.filter(onlyUnique)
}

export function uniqueBy<T>(array: T[], keyGetter: (input: T) => string): T[] {
  const hash = array.reduce((acc, t) => {
    acc[keyGetter(t)] = t
    return acc
  }, <any>{})
  return Object.values(hash)
}

export function sortBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Array<V> {
  return [...list].sort((a, b) => {
    const keyA = keyGetter(a)
    const keyB = keyGetter(b)
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  })
}

export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
  const map = new Map<K, Array<V>>()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

export function equal(array1: any[], array2: any[]) {
  return JSON.stringify(array1) === JSON.stringify(array2)
}

export function ensureArray(a: any): any[] {
  return Array.isArray(a) ? a : [a]
}

export async function filterAsync<T>(arr: T[], callback: (t: T) => Promise<boolean>): Promise<T[]> {
  const fail = Symbol()
  // @ts-ignore
  return (
    await Promise.all(arr.map(async (item) => ((await callback(item)) ? item : fail)))
  ).filter((i) => i !== fail)
}

export function repeat<T>(count: number, producer: (index: number) => T): T[] {
  const result: T[] = []
  for (let i = 0; i < count; i++) {
    result.push(producer(i))
  }
  return result
}

export function take<T>(amount: number, t: T[] | null): T[] | null {
  if (t === null) {
    return null
  }
  if (amount > t.length) {
    return t
  }
  return t.slice(0, amount)
}

export function drop<T>(amount: number, t: T[] | null): T[] | null {
  if (t === null) {
    return null
  }
  if (amount > t.length) {
    return null
  }

  return t.slice(amount)
}

export function replaceElement<T>(array: T[], t: T, predicate: (t: T) => boolean): boolean {
  const index = array.findIndex(predicate)
  if (index === -1) {
    return false
  }
  array[index] = t
  return true
}

export function dropLast<T>(array: T[]): T[] {
  if (array.length > 1) {
    return array.slice(0, array.length - 1)
  }
  return []
}

export function last<T>(array: T[]): T | null {
  if (array.length === 0) {
    return null
  }
  return array[array.length - 1]
}

export function first<T>(array: T[]): T | null {
  if (array.length === 0) {
    return null
  }
  return array[0]
}

export function tail<T>(array: T[]): T[] {
  if (array.length < 2) {
    return []
  }
  return array.filter((v, i) => i !== 0)
}

export function dropNulls<T>(array: (T | null)[]): T[] {
  return array.filter((v) => v !== null) as T[]
}

export function findMandatory<T>(
  array: T[],
  predicate: (t: T) => boolean,
  message = 'Did not find item in array',
): T {
  const maybe = array.find(predicate)
  if (maybe) {
    return maybe
  }
  throw new Error(message)
}

export function compare<T = any>(
  left: T[],
  right: T[],
  comparableProducer: (t: T) => any = (t: T) => t,
): { leftOnly: T[]; both: T[]; rightOnly: T[] } {
  const leftOnly = left.filter(
    (aLeft) =>
      right.find((aRight) => comparableProducer(aLeft) === comparableProducer(aRight)) ===
      undefined,
  )
  const rightOnly = right.filter(
    (aRight) =>
      left.find((aLeft) => comparableProducer(aLeft) === comparableProducer(aRight)) === undefined,
  )
  const both = uniqueBy([...left, ...right], comparableProducer).filter(
    (aBoth) => leftOnly.indexOf(aBoth) === -1 && rightOnly.indexOf(aBoth) === -1,
  )
  return { leftOnly, both, rightOnly }
}

export function dropFields<T>(array: T[], ...fieldNames: string[]): T[] {
  return array.map((item) => {
    const newItem = { ...item } as any
    for (const fieldName of fieldNames) {
      delete newItem[fieldName]
    }
    return newItem
  })
}

export function splitLast<T>(array: T[]): [T[], T] {
  const last = array[array.length - 1]
  const rest = array.slice(0, array.length - 1)
  return [rest, last]
}

export function chunk<T>(array: T[], size: number): T[][] {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}
