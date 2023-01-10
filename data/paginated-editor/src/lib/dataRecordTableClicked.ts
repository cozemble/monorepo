import type { DataRecordPathFocus } from './DataRecordPathFocus'
import type { Writable } from 'svelte/store'

export function dataRecordTableClicked(focus: Writable<DataRecordPathFocus>, event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target && target.nodeName == 'TD') {
    const dataRecordPath = target.getAttribute('data-record-path')
    if (dataRecordPath) {
      focus.update((f) => f.focusFromDottedNamePath(dataRecordPath))
    } else {
      focus.update((f) => f.clearFocus())
    }
  } else {
    focus.update((f) => f.clearFocus())
  }
}
