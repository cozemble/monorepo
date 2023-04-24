import type { Readable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { JustErrorMessage } from '@cozemble/lang-util'

export interface EventSourcedStore<T, A> extends Readable<T> {
  dispatch: (action: A) => void
  undo: () => void
  save: () => Promise<JustErrorMessage | null>
  cancel: () => void
  set: (state: T) => void
}

export type Reducer<T, A> = (state: T, action: A) => T

export function eventSourcedStore<T, A>(
  reducer: Reducer<T, A>,
  saveFn: (state: T) => Promise<JustErrorMessage | null>,
  initialState: T,
): EventSourcedStore<T, A> {
  let _actions: A[] = []
  let _state: T[] = [initialState]
  const { subscribe, update } = writable<T>(initialState)
  const dispatch = (action: A) =>
    update((state) => {
      const mutated = reducer(state, action)
      _actions.push(action)
      _state.push(mutated)
      return mutated
    })
  const undo = () =>
    update(() => {
      _state.pop()
      _actions.pop()
      return _state[_state.length - 1]
    })
  const save = () => saveFn(_state[_state.length - 1])
  const cancel = () => {
    _actions.length = 0
    _state.length = 1
    update(() => _state[0])
  }
  const set = (state: T) => {
    _actions = []
    _state = [state]
    update(() => _state[0])
  }
  return { subscribe, dispatch, undo, save, cancel, set }
}
