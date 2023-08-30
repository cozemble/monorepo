import type {
  Action,
  ApportionColumnContents,
  DeleteRows,
  ExtractRows,
  LabelTable,
  MergeTables,
} from './ocrCorrectiveActions'
import type { FomIssue } from '@cozemble/frontend-cozemble-forms'
import type { Page, Table } from '@cozemble/backend-aws-ocr-types'

function labelThisTable(action: LabelTable, table: Table): Table {
  if (table.rows.length > 1) {
    const heading = table.rows[0].cells.join(',')
    if (action.criteria.length > 1) {
      throw new Error('Only one criteria is supported atm')
    }
    const criteria = action.criteria[0]
    if (criteria.logicalOperator !== 'and') {
      throw new Error('Only and is supported atm')
    }
    const terms = criteria.terms
    if (terms.length > 1) {
      throw new Error('Only one term is supported atm')
    }
    const term = terms[0]
    if (term.type !== 'headerMatches') {
      throw new Error('Only headerMatches is supported atm')
    }
    const regex = new RegExp(term.regex)
    if (regex.test(heading)) {
      return {
        ...table,
        label: action.tableLabel,
        hasHeader: action.tableHasHeader,
      }
    }
  }
  return table
}

function labelTableOnPage(action: LabelTable, page: Page) {
  return {
    ...page,
    items: page.items.map((item) => {
      if (item._type === 'table') {
        return labelThisTable(action, item)
      }
      return item
    }),
  }
}

function labelTable(action: LabelTable, pages: Page[]) {
  return pages.map((page) => labelTableOnPage(action, page))
}

function deleteRowsInThisTable(action: DeleteRows, table: Table): Table {
  const regex = new RegExp(action.rowRegex)
  return {
    ...table,
    rows: table.rows.filter((row) => {
      const rowStr = row.cells.join(',')
      return !regex.test(rowStr)
    }),
  }
}

function deleteRowsOnPage(action: DeleteRows, page: Page) {
  return {
    ...page,
    items: page.items.map((item) => {
      if (item._type === 'table' && item.label === action.tableLabel) {
        return deleteRowsInThisTable(action, item)
      }
      return item
    }),
  }
}

function deleteRows(action: DeleteRows, pages: Page[]) {
  return pages.map((page) => deleteRowsOnPage(action, page))
}

function apportionColumnContents(action: ApportionColumnContents, pages: Page[]): Page[] {
  const sourceTables = pages.flatMap((p) =>
    p.items.filter((i) => i._type === 'table' && i.label === action.tableLabel),
  ) as Table[]
  const selectedColumnIndex = sourceTables[0].rows[0].cells.findIndex(
    (cell) => cell === action.sourceColumnName,
  )
  const keyColumnIndex = sourceTables[0].rows[0].cells.findIndex(
    (cell) => cell === action.keyColumnName,
  )
  const flattenedColumnContents = sourceTables
    .flatMap((table) => {
      const dataRows = table.hasHeader ? table.rows.slice(1) : table.rows
      return dataRows.map((row) => row.cells[selectedColumnIndex])
    })
    .join('\n')
  const regex = new RegExp(action.apportioningRegex, 'gm')
  const matches = Array.from(flattenedColumnContents.matchAll(regex))
  let matchIndex = 0
  return pages.map((p) => {
    return {
      ...p,
      items: p.items.map((item) => {
        if (item._type === 'table' && item.label === action.tableLabel) {
          const rows = item.rows.flatMap((row, rowIndex) => {
            if (item.hasHeader && rowIndex === 0) {
              return [row]
            }
            if (row.cells[keyColumnIndex] === '') {
              console.log('Skipping row due to key column being empty', row)
              return []
            }
            const cells = row.cells.map((cell, columnIndex) => {
              if (columnIndex === selectedColumnIndex) {
                const match = matches[matchIndex]
                matchIndex += 1
                return match ? match[0] : ''
              }
              return cell
            })
            return [{ ...row, cells }]
          })
          return { ...item, rows }
        }
        return item
      }),
    }
  })
}

function extractRows(action: ExtractRows, pages: Page[]): Page[] {
  const sourceTables = pages.flatMap((p) =>
    p.items.filter((i) => i._type === 'table' && i.label === action.sourceTableLabel),
  ) as Table[]
  let sourceRows = sourceTables.flatMap((table) => {
    if (action.rowSelector.type === 'rowRangeSelector') {
      return table.rows.slice(action.rowSelector.start, action.rowSelector.end)
    }
    const regex = new RegExp(action.rowSelector.regex)
    return table.rows.filter((row) => regex.test(row.cells.join(',')))
  })
  if (sourceTables[0].hasHeader) {
    const clonedHeader = JSON.parse(JSON.stringify(sourceTables[0].rows[0]))
    sourceRows = [clonedHeader, ...sourceRows]
  }
  const maybeTargetTable = pages
    .flatMap((p) => p.items)
    .find((i) => i._type === 'table' && i.label === action.targetTableLabel)
  if (maybeTargetTable) {
    return pages.map((p) => ({
      ...p,
      items: p.items.map((item) => {
        if (item._type === 'table' && item.label === action.targetTableLabel) {
          return { ...item, rows: [...item.rows, ...sourceRows] }
        }
      }),
    })) as Page[]
  }
  const newTable: Table = {
    _type: 'table',
    rows: sourceRows,
    label: action.targetTableLabel,
  }

  let inserted = false
  return pages.map((p) => {
    return {
      ...p,
      items: p.items.flatMap((item) => {
        if (item._type === 'table' && item.label === action.sourceTableLabel) {
          item = { ...item, rows: item.rows.filter((row) => !sourceRows.includes(row)) }
          if (inserted) {
            return [item]
          }
          inserted = true
          return [newTable, item]
        }
        return item
      }),
    }
  })
}

function mergeTables(action: MergeTables, pages: Page[]) {
  const tables = pages.flatMap((p) =>
    p.items.filter((i) => i._type === 'table' && i.label === action.tableLabel),
  ) as Table[]
  const rows = tables.flatMap((t, index) => {
    if (index === 0) {
      return t.rows
    }
    if (t.hasHeader) {
      return t.rows.slice(1)
    }
    return t.rows
  })
  const mergedTable = { ...tables[0], rows }
  let found = false
  return pages.map((p) => {
    return {
      ...p,
      items: p.items.flatMap((item) => {
        if (item._type === 'table' && item.label === action.tableLabel) {
          if (found) {
            return []
          }
          found = true
          return [mergedTable]
        }
        return item
      }),
    }
  })
}

function applyCorrection(action: Action, pages: Page[]) {
  if (action.action === 'labelTable') {
    return labelTable(action, pages)
  }
  if (action.action === 'deleteRows') {
    return deleteRows(action, pages)
  }
  if (action.action === 'mergeTables') {
    return mergeTables(action, pages)
  }
  if (action.action === 'extractRows') {
    return extractRows(action, pages)
  }
  if (action.action === 'apportionColumnContents') {
    return apportionColumnContents(action, pages)
  }
  return pages
}

export function applyCorrections(actions: Action[], errors: FomIssue[], pages: Page[]): Page[] {
  if (errors.length === 0) {
    return actions.reduce((ps, action) => applyCorrection(action, ps), pages)
  }
  return pages
}
