import type { Table } from '@cozemble/backend-aws-ocr-types'

export function tableToCsv(table: Table): string {
  const rows = table.rows.map((r) => {
    return r.cells
      .map((cell) => {
        if (cell.includes(',')) {
          return `"${cell}"`
        }
        return cell
      })
      .join(',')
  })
  return rows.join('\n')
}
