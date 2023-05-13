import type { DataRecordPathFocus } from '@cozemble/data-paginated-editor'
import type { DataRecord, DataRecordPathParentElement, LeafModelSlot } from '@cozemble/model-core'

export class DataTableFocus {
  constructor(
    private readonly recordsProvider: () => DataRecord[],
    public readonly rowIndex: number | null = null,
    public readonly dataRecordPathFocus: DataRecordPathFocus | null = null,
    public readonly isEditing = false,
  ) {}

  setFocus(rowIndex: number, dataRecordPathFocus: DataRecordPathFocus): DataTableFocus {
    return new DataTableFocus(this.recordsProvider, rowIndex, dataRecordPathFocus)
  }

  isFocused(
    rowIndex: number,
    parentElements: DataRecordPathParentElement[],
    slot: LeafModelSlot,
  ): boolean {
    console.log({ rowIndex, focus: this, parentElements, slot })
    return (
      this.dataRecordPathFocus !== null &&
      this.rowIndex === rowIndex &&
      this.dataRecordPathFocus.isPropertyFocussed(slot, parentElements)
    )
  }

  beginEditing(): DataTableFocus {
    return new DataTableFocus(this.recordsProvider, this.rowIndex, this.dataRecordPathFocus, true)
  }

  moveForward(): DataTableFocus {
    if (this.dataRecordPathFocus === null) {
      return this
    }
    return new DataTableFocus(
      this.recordsProvider,
      this.rowIndex,
      this.dataRecordPathFocus.moveFocus('right'),
      this.isEditing,
    )
  }

  clearFocus(): DataTableFocus {
    return new DataTableFocus(this.recordsProvider)
  }

  ensureNotFocusedOnRow(rowIndex: number): DataTableFocus {
    console.log({ rowIndex, focus: this })
    if (this.rowIndex === rowIndex) {
      return this.clearFocus()
    }
    return this
  }
}

export function emptyDataTableFocus(recordsProvider: () => DataRecord[]): DataTableFocus {
  return new DataTableFocus(recordsProvider)
}

export interface DataTableFocusControls {
  setFocus(rowIndex: number, slot: LeafModelSlot): void

  keydown(event: KeyboardEvent): void

  moveForward(): void

  beginEditing(): void

  clearFocus(): void

  ensureNotFocusedOnRow(rootRecordIndex: number): void
}

export interface DataTableFocusControls2 {
  setFocus(
    rowIndex: number,
    slot: LeafModelSlot,
    parentElements: DataRecordPathParentElement[],
  ): void

  clearFocus(): void

  keydown(event: KeyboardEvent): void

  moveForward(): void

  beginEditing(): void

  ensureNotFocusedOnRow(rootRecordIndex: number): void
}
