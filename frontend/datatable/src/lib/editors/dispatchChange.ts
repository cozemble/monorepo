import type { EditableValue } from './editableValue'
import type { EventSourcedStore } from '../stores/EventSourcedStore'

export function dispatchChange<T, A, V>(
  store: EventSourcedStore<T, A>,
  value: EditableValue<V>,
  actionMaker: (value: V | null) => A,
): boolean {
  if (value.hasChanged) {
    store.dispatch(actionMaker(value.value.get()))
    return true
  }
  return false
}
