import type { Readable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { JustErrorMessage } from '@cozemble/lang-util'

export interface EventSourcedStore<T, A> extends Readable<T> {
  dispatch: (action: A) => void
  undo: () => void
  saveAndFlushActions: () => Promise<JustErrorMessage | null>
  cancel: () => void
}

export type Reducer<T, A> = (state: T, action: A) => T

export function eventSourcedStore<T, A>(
  reducer: Reducer<T, A>,
  saveFn: (actions: A[], state: T) => Promise<JustErrorMessage | null>,
  initialState: T,
): EventSourcedStore<T, A> {
  const _actions: A[] = []
  const _state: T[] = [initialState]
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
  const saveAndFlushActions = () => saveFn(_actions, _state[_state.length - 1])
  const cancel = () => {
    _actions.length = 0
    _state.length = 1
    update(() => _state[0])
  }
  return { subscribe, dispatch, undo, saveAndFlushActions, cancel }
}
