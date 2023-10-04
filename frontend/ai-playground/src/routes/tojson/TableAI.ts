import type { TableTypeGuessWithTableIndex } from '../genai/tables/guessTableType/guessTableType'
import { guessTableType } from '../genai/tables/guessTableType/guessTableType'
import type { Page, Table } from '@cozemble/backend-aws-ocr-types'
import { tablesOnly } from './helpers'
import { tableToCsv } from '../fromDocument/tableToCsv'

export interface TableIntelligence {
  tables: Table[]
  tableTypeGuess: TableTypeGuessWithTableIndex[]
}

export function limitRows(limit: number, table: Table): Table {
  const rows = table.rows.slice(0, limit)
  return { ...table, rows }
}

// export type TableAnalysisSteps = 'guessTableType'
// export type SectionAnalysisSteps = 'guessSections'
// export type AnalysisSteps = TableAnalysisSteps | SectionAnalysisSteps

export function flattenTables(pages: Page[]): Table[] {
  return pages.flatMap((p) => p.items).filter((i) => i._type === 'table') as Table[]
}

export async function beginInitialTableAnalysis(pages: Page[]): Promise<TableIntelligence> {
  const pagesWithTablesOnly = pages.map(tablesOnly)
  // const tables = (pagesWithTablesOnly.flatMap((p) => p.items) as Table[]).map((table) =>
  //   limitRows(3, table),
  // )
  const tables = pagesWithTablesOnly.flatMap((p) => p.items) as Table[]
  const tableCount = tables.length
  if (tableCount === 0) {
    return { tables: [], tableTypeGuess: [] }
  }
  const tablesAsCsv = tables
    .map((t, index) => {
      const csv = tableToCsv(t)
      return `Table ${index + 1}\n${csv}\n`
    })
    .join('\n')
  const tableTypeGuess = await guessTableType(tableCount, tablesAsCsv)
  return { tables, tableTypeGuess }
}
