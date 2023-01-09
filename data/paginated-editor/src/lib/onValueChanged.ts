import type { DataRecord } from '@cozemble/model-core'
import type { CellFocus } from '$lib/CellFocus'
import type { Writable } from 'svelte/store'
import type { DataRecordValueChanged } from '@cozemble/model-editor-sdk'
import { dataRecordPathFns } from '@cozemble/model-api'

export function applyValueChangedToRecord(
  r: DataRecord,
  event: DataRecordValueChanged,
): DataRecord {
  return dataRecordPathFns.setValue(event.path, r, event.newValue)
}

export function adjustFocusFollowingValueChange(
  event: DataRecordValueChanged,
  focus: Writable<CellFocus | null>,
) {
  if (event.confirmMethod === 'Tab') {
    focus.update((f) => (f ? { ...f, column: f.column + 1 } : null))
  }
}
