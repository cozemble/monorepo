export interface CellFocus {
    _type: "cell.focus"
    row: number
    column: number
}

export function cellFocus(row: number, column: number): CellFocus {
    return {
        _type: "cell.focus",
        row,
        column
    }
}