import type { Action, DeleteRows, LabelTable, MergeTables } from './ocrCorrectiveActions'
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
    if (term.type !== 'header_matches') {
      throw new Error('Only header_matches is supported atm')
    }
    const regex = new RegExp(term.regex)
    if (regex.test(heading)) {
      return {
        ...table,
        label: action.tableLabel,
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
      console.log({ table, rowStr, regex })
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

function mergeTables(action: MergeTables, pages: Page[]) {
  const tables = pages.flatMap((p) =>
    p.items.filter((i) => i._type === 'table' && i.label === action.tableLabel),
  ) as Table[]
  const rows = tables.flatMap((t, index) => {
    if (index === 0) {
      return t.rows
    }
    if (action.tableHasHeader) {
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
  return pages
}

export function applyCorrections(actions: Action[], errors: FomIssue[], pages: Page[]): Page[] {
  if (errors.length === 0) {
    return actions.reduce((ps, action) => applyCorrection(action, ps), pages)
  }
  return pages
}
