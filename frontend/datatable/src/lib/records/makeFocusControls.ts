import type { DataTableFocus, DataTableFocusControls2 } from '../focus/DataTableFocus'
import type {
  DataRecord,
  DataRecordPathParentElement,
  LeafModelSlot,
  Model,
  SystemConfiguration,
} from '@cozemble/model-core'
import { dataRecordValuePathFns } from '@cozemble/model-api'
import { DataRecordPathFocus } from '@cozemble/data-paginated-editor'
import { mandatory } from '@cozemble/lang-util'
import type { GettableWritable } from '../editors/GettableWritable'

export function makeFocusControls(
  modelsProvider: () => Model[],
  recordsProvider: () => DataRecord[],
  systemConfigurationProvider: () => SystemConfiguration,
  focus: GettableWritable<DataTableFocus>,
): DataTableFocusControls2 {
  return {
    setFocus(
      rowIndex: number,
      slot: LeafModelSlot,
      parentElements: DataRecordPathParentElement[],
    ): void {
      const newFocus = new DataRecordPathFocus(
        modelsProvider(),
        () => mandatory(recordsProvider()[rowIndex], `No record at index ${rowIndex}`),
        systemConfigurationProvider(),
        dataRecordValuePathFns.newInstance(slot, ...parentElements),
      )
      focus.update((currentFocus) => {
        return currentFocus.setFocus(rowIndex, newFocus)
      })
    },

    keydown(event: KeyboardEvent): void {
      const focusValue = focus.get()
      if (!focusValue.isEditing && event.key === 'Enter') {
        event.stopPropagation()
        event.preventDefault()
        focus.update((f) => f.beginEditing())
      }
    },

    moveForward(): void {
      focus.update((f) => f.moveForward())
    },

    beginEditing() {
      focus.update((f) => f.beginEditing())
    },

    clearFocus() {
      focus.update((f) => f.clearFocus())
    },

    ensureNotFocusedOnRow(rootRecordIndex: number) {
      focus.update((f) => f.ensureNotFocusedOnRow(rootRecordIndex))
    },
  }
}
