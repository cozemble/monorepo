import { writable, type Writable } from 'svelte/store'

interface GettableWritable<T> extends Writable<T> {
  get: () => T
}

export function gettableWritable<T>(initialValue: T): GettableWritable<T> {
  let value = initialValue
  const { set, subscribe } = writable(initialValue)

  return {
    set,
    subscribe,
    get: () => value,
    update: (updater: (value: T) => T) => {
      set((value = updater(value)))
    },
  }
}
