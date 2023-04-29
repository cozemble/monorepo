import type { Readable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { JustErrorMessage } from '@cozemble/lang-util'

export interface EventSourcedStore<T, A> extends Readable<T> {
  dispatch: (action: A) => void
  undo: () => void
  save: () => Promise<JustErrorMessage | null>
  cancel: () => void
  set: (state: T) => void
  update: (fn: (state: T) => T) => void
}

export type Reducer<T, A> = (state: T, action: A) => T

export function eventSourcedStore<T, A>(
  reducer: Reducer<T, A>,
  saveFn: (state: T) => Promise<JustErrorMessage | null>,
  initialState: T,
): EventSourcedStore<T, A> {
  let _actions: A[] = []
  let _state: T[] = [initialState]
  const { subscribe, update: innerUpdate } = writable<T>(initialState)
  const dispatch = (action: A) =>
    innerUpdate((state) => {
      const mutated = reducer(state, action)
      console.log({ action, mutated })
      _actions.push(action)
      _state.push(mutated)
      return mutated
    })
  const undo = () =>
    innerUpdate(() => {
      _state.pop()
      _actions.pop()
      return _state[_state.length - 1]
    })
  const save = () => saveFn(_state[_state.length - 1])
  const cancel = () => {
    _actions.length = 0
    _state.length = 1
    innerUpdate(() => _state[0])
  }
  const set = (state: T) => {
    _actions = []
    _state = [state]
    innerUpdate(() => _state[0])
  }
  const update = (fn: (state: T) => T) =>
    innerUpdate((state) => {
      const mutated = fn(state)
      _state[_state.length - 1] = mutated
      return mutated
    })
  return { subscribe, dispatch, undo, save, cancel, set, update }
}
