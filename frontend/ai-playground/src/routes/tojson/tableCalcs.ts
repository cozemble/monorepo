import type { TableTypeGuess } from '../genai/tables/guessTableType/guessTableType'
import { arrays } from '@cozemble/lang-util'

export interface DuplicationCandidate {
  tableLabel: string
  tableIndices: number[]
  shouldDedupe?: boolean
}

export interface MergeCandidate {
  tableLabel: string
  tableIndices: number[]
  shouldMerge?: boolean
}

export function calculateDuplicationCandidates(
  tableAnalysis: TableTypeGuess[],
): DuplicationCandidate[] {
  const layoutTables = arrays.groupBy(
    tableAnalysis.filter((t) => t.type === 'layout'),
    (t) => t.label,
  )
  const candidates = Array.from(layoutTables.keys()).reduce((acc, label) => {
    const tables = layoutTables.get(label) || []
    const tableIndices = tables.map((t) => t.tableIndex)
    return [...acc, { tableLabel: label, tableIndices }]
  }, [] as DuplicationCandidate[])
  return candidates.filter((c) => c.tableIndices.length > 1)
}

export function calculateMergeCandidates(tableAnalysis: TableTypeGuess[]): MergeCandidate[] {
  const dataTables = arrays.groupBy(
    tableAnalysis.filter((t) => t.type === 'rows'),
    (t) => t.label,
  )
  const candidates = Array.from(dataTables.keys()).reduce((acc, label) => {
    const tables = dataTables.get(label) || []
    const tableIndices = tables.map((t) => t.tableIndex)
    return [...acc, { tableLabel: label, tableIndices }]
  }, [] as MergeCandidate[])
  return candidates.filter((c) => c.tableIndices.length > 1)
}
