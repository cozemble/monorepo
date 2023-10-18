export interface TableTypeGuess {
  tableIndex: number
  type: 'rows' | 'layout'
  label: string
}

export interface SectionGuess {
  sectionName: string
  lines: string[]
}

export interface TableTypeGuessWithTableIndex {
  tableIndex: number
  type: 'rows' | 'layout'
  label: string
}

export async function guessTableType(
  tableCount: number,
  tablesAsCsv: string,
): Promise<TableTypeGuessWithTableIndex[]> {
  const aiResponse: TableTypeGuess[] = await callSyncGenAi('/genai/tables/guessTableType', {
    tableCount,
    tablesAsCsv,
  })
  return aiResponse.map((r) => ({
    tableIndex: r.tableIndex,
    type: r.type,
    label: r.label,
  }))
}

export async function callSyncGenAi<T = any>(url: string, body: any): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: JSON.stringify(body) }),
    })
    if (!response.ok) {
      throw new Error(`Failed to guess table type: ${response.statusText}`)
    }
    const { result } = await response.json()
    return result
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }
}
