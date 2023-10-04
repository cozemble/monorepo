import { callSyncGenAi } from '../guessTableType/guessTableType'

export interface CategorizedTableRows {
  rowIndex: number
  category: string
}

export async function categorizeTableRows(tableHtml: string): Promise<CategorizedTableRows[]> {
  return callSyncGenAi('/genai/tables/categorizeTableRows', { tableHtml })
}
