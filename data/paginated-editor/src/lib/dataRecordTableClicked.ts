import type { DataRecordPathFocus } from './DataRecordPathFocus'
import type { Writable } from 'svelte/store'

export function dataRecordTableClicked(focus: Writable<DataRecordPathFocus>, event: MouseEvent) {
  const target = event.target as HTMLElement
  const nearestTd = target.closest('td')
  if (nearestTd) {
    const dataRecordPath = nearestTd.getAttribute('data-record-path')
    console.log({ dataRecordPath })
    if (dataRecordPath) {
      focus.update((f) => f.focusFromDottedNamePath(dataRecordPath))
    } else {
      focus.update((f) => f.clearFocus())
    }
  } else {
    focus.update((f) => f.clearFocus())
  }
}
