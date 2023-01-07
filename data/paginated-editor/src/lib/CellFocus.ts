export interface CellFocus {
  _type: 'cell.focus'
  row: number
  column: number
}

export function cellFocus(row: number, column: number): CellFocus {
  return {
    _type: 'cell.focus',
    row,
    column,
  }
}

export function isFocussedCell(focus: CellFocus | null, row: number, column: number) {
  return focus && focus.row === row && focus.column === column
}

export function isFocussedRow(focus: CellFocus | null, row: number) {
  return focus && focus.row === row
}
