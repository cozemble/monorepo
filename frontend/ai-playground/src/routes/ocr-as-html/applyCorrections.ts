import type {
  Action,
  ApportionColumnContents,
  DeleteRows,
  DropColumns,
  ExtractRows,
  LabelTable,
  MergeTables,
  OutlineSection,
} from './ocrCorrectiveActions'
import type { FomIssue } from '@cozemble/frontend-cozemble-forms'
import type { BlockItem, LabeledSection, Line, Page, Table } from '@cozemble/backend-aws-ocr-types'

function labelThisTable(action: LabelTable, table: Table): Table {
  if (table.rows.length > 1) {
    const heading = table.rows[0].cells.join(',')
    const regex = new RegExp(action.tableHeaderRegex)
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

function dropColumnsInPage(action: DropColumns, p: Page): Page {
  const columnNames = action.columnNames.split(',')
  return {
    ...p,
    items: p.items.map((item) => {
      if (item._type === 'table' && item.label === action.tableLabel) {
        return {
          ...item,
          rows: item.rows.map((row) => {
            return {
              ...row,
              cells: row.cells.filter(
                (cell, index) => !columnNames.includes(item.rows[0].cells[index]),
              ),
            }
          }),
        }
      }
      return item
    }),
  } as Page
}

function dropColumns(action: DropColumns, pages: Page[]): Page[] {
  return pages.map((p) => dropColumnsInPage(action, p))
}

function findOutlinedSection(action: OutlineSection, pages: Page[]): LabeledSection | null {
  let allLines = pages.flatMap((p) => p.items.filter((i) => i._type === 'line')) as Line[]
  const leftRegexes = action.left.split(',').map((s) => new RegExp(s))
  const matchingLeftLines = leftRegexes.flatMap((regex) =>
    allLines.filter((line) => regex.test(line.text)),
  )
  const leftMostLine = matchingLeftLines.reduce((leftMost, line) => {
    if (line.boundingBox.left < leftMost.boundingBox.left) {
      return line
    }
    return leftMost
  }, matchingLeftLines[0])
  const topRegexes = action.top.split(',').map((s) => new RegExp(s))
  const matchingTopLines = topRegexes.flatMap((regex) => {
    return allLines.filter((line) => regex.test(line.text))
  })
  const topMostLine = matchingTopLines.reduce((topMost, line) => {
    if (line.boundingBox.top < topMost.boundingBox.top) {
      return line
    }
    return topMost
  }, matchingTopLines[0])
  const rightRegexes = action.right.split(',').map((s) => new RegExp(s))
  const matchingRightLines = rightRegexes.flatMap((regex) =>
    allLines.filter((line) => regex.test(line.text)),
  )
  const rightMostLine = matchingRightLines.reduce((rightMost, line) => {
    if (line.boundingBox.left > rightMost.boundingBox.left) {
      return line
    }
    return rightMost
  }, matchingRightLines[0])
  const bottomRegexes = action.bottom.split(',').map((s) => new RegExp(s))
  const matchingBottomLines = bottomRegexes.flatMap((regex) =>
    allLines.filter((line) => regex.test(line.text)),
  )
  const bottomMostLine = matchingBottomLines.reduce((bottomMost, line) => {
    if (line.boundingBox.top > bottomMost.boundingBox.top) {
      return line
    }
    return bottomMost
  }, matchingBottomLines[0])
  if (!leftMostLine || !rightMostLine || !bottomMostLine || !topMostLine) {
    return null
  }
  console.log({ matchingLeftLines, matchingRightLines, matchingTopLines, matchingBottomLines })
  if (!action.leftIsInclusive) {
    allLines = allLines.filter((line) => !matchingLeftLines.includes(line))
  }
  if (!action.rightIsInclusive) {
    allLines = allLines.filter((line) => !matchingRightLines.includes(line))
  }
  if (!action.topIsInclusive) {
    allLines = allLines.filter((line) => !matchingTopLines.includes(line))
  }
  if (!action.bottomIsInclusive) {
    allLines = allLines.filter((line) => !matchingBottomLines.includes(line))
  }
  const linesInSection = allLines.filter((line) => {
    return (
      line.boundingBox.top >= topMostLine.boundingBox.top &&
      line.boundingBox.top <= bottomMostLine.boundingBox.top &&
      line.boundingBox.left >= leftMostLine.boundingBox.left &&
      line.boundingBox.left <= rightMostLine.boundingBox.left
    )
  })
  return { _type: 'labeledSection', label: action.sectionLabel, items: linesInSection }
}

function notInSection(newSections: LabeledSection[], item: BlockItem) {
  const allItemsInSections = newSections.flatMap((s) => s.items)
  return !allItemsInSections.includes(item)
}

function outlineSection(action: OutlineSection, pages: Page[]): Page[] {
  const section = findOutlinedSection(action, pages)
  const existingSections = pages[0].sections ?? []
  const newSections = section ? [...existingSections, section] : existingSections
  return pages.map((p, index) => ({
    ...p,
    sections: index === 0 ? newSections : p.sections,
    items: p.items.filter((item) => notInSection(newSections, item)),
  }))
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
    hasHeader: sourceTables[0].hasHeader,
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
  if (action.action === 'dropColumns') {
    return dropColumns(action, pages)
  }
  if (action.action === 'outlineSection') {
    return outlineSection(action, pages)
  }
  return pages
}

export function applyCorrections(actions: Action[], errors: FomIssue[], pages: Page[]): Page[] {
  if (errors.length === 0) {
    return actions.reduce((ps, action) => applyCorrection(action, ps), pages)
  }
  return pages
}

export interface Sections {
  topLeft: boolean
  topRight: boolean
  bottomLeft: boolean
  bottomRight: boolean
}

function isInScope(item: BlockItem, sections: Sections) {
  if (item.boundingBox === undefined) {
    return true
  }
  if (sections.topLeft && item.boundingBox.top < 0.5 && item.boundingBox.left < 0.5) {
    return true
  }
  if (sections.topRight && item.boundingBox.top < 0.5 && item.boundingBox.left > 0.5) {
    return true
  }
  if (sections.bottomLeft && item.boundingBox.top > 0.5 && item.boundingBox.left < 0.5) {
    return true
  }
  if (sections.bottomRight && item.boundingBox.top > 0.5 && item.boundingBox.left > 0.5) {
    return true
  }

  return false
}

function scopePageContent(p: Page, sections: Sections): Page {
  return { ...p, items: p.items.filter((item) => isInScope(item, sections)) }
}

export function scopeContent(pages: Page[], sections: Sections): Page[] {
  return pages.map((p) => scopePageContent(p, sections))
}
