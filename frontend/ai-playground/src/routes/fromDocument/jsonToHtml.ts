import type { BlockItem, Page, Row } from '@cozemble/backend-aws-ocr-types'
import { strings } from '@cozemble/lang-util'

function rowToHtml(row: Row): string {
  return `<tr>${row.cells.reduce((acc, cell) => acc + `<td>${cell}</td>`, '')}</tr>`
}

function rowsToHtml(rows: Row[]): string {
  return rows.reduce((acc, row) => acc + rowToHtml(row), '')
}

function itemToHtml(item: BlockItem): string {
  if (item._type === 'line') {
    return `<p>${item.text}</p>`
  }
  const id = item.label ? ` id="${strings.camelize(item.label)}"` : ''
  return `<table ${id}>${rowsToHtml(item.rows)}</table>`
}

function pageToHtml(page: Page): string {
  return page.items.reduce((acc, item) => acc + itemToHtml(item), '')
}

export function jsonToHtml(pages: Page[]): string {
  return pages.reduce((acc, page) => acc + pageToHtml(page), '')
}
