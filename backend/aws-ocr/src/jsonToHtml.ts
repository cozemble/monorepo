import { BlockItem, Page, ProcessedTextractDocument, Row } from './textractToJson'

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
  return `<table border="1">${rowsToHtml(item.rows)}</table>`
}

function pageToHtml(page: Page): string {
  return page.items.reduce((acc, item) => acc + itemToHtml(item), '')
}

export function jsonToHtml(processed: ProcessedTextractDocument): string {
  return processed.pages.reduce((acc, page) => acc + pageToHtml(page), '')
}
