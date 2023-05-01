import { writable, type Writable } from 'svelte/store'

export interface GettableWritable<T> extends Writable<T> {
  get: () => T
}

export function gettableWritable<T>(initialValue: T): GettableWritable<T> {
  let value = initialValue
  const { set: originalSet, subscribe } = writable(initialValue)
  const set = (newValue: T) => {
    value = newValue
    originalSet(newValue)
  }
  return {
    set,
    subscribe,
    get: () => value,
    update: (updater: (value: T) => T) => {
      set((value = updater(value)))
    },
  }
}
