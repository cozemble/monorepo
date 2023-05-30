import type { DataRecordId } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import type { DataRecord } from '@cozemble/model-core'

export function expandRecord(expandedRecordIds: Writable<DataRecordId[]>, id: DataRecordId) {
  expandedRecordIds.update((ids: DataRecordId[]) => [...ids, id])
}

export function collapseRecord(expandedRecordIds: Writable<DataRecordId[]>, id: DataRecordId) {
  expandedRecordIds.update((ids: DataRecordId[]) => ids.filter((x) => x.value !== id.value))
}

export function expandLastRow(expandedRecordIds: Writable<DataRecordId[]>, records: DataRecord[]) {
  expandRecord(expandedRecordIds, records[records.length - 1].id)
}

export function flashRow(rowIndex: number) {
  const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`) as HTMLElement
  const extraClasses = ['border', 'border-primary', 'border-4']
  if (row) {
    for (const extraClass of extraClasses) {
      row.classList.add(extraClass)
    }
    setTimeout(() => {
      for (const extraClass of extraClasses) {
        row.classList.remove(extraClass)
      }
    }, 1000)
  }
}
