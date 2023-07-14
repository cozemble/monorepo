export interface EditingControlEvent {
  _type: 'editing.control.event'
  type: 'editingFinished' | 'editingCancelled'
}

export const isEditingControlEvent = (e: any): e is EditingControlEvent => {
  return e?._type === 'editing.control.event'
}

export type ChangeHandler<T> = (
  newValue: T | null,
  associatedEvent: EditingControlEvent | KeyboardEvent | null,
) => void
