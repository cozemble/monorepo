import type { BlockItem, LabeledSection, Page, Row, Table } from '@cozemble/backend-aws-ocr-types'
import { strings } from '@cozemble/lang-util'

function rowToHtml(row: Row): string {
  return `<tr>${row.cells.reduce((acc, cell) => acc + `<td>${cell}</td>`, '')}</tr>`
}

function rowsToHtml(rows: Row[]): string {
  return rows.reduce((acc, row) => acc + rowToHtml(row), '')
}

export function tableToHtml(item: Table) {
  const id = item.label ? ` id="${strings.camelize(item.label)}"` : ''
  return `<table ${id}>${rowsToHtml(item.rows)}</table>`
}

function itemToHtml(item: BlockItem): string {
  if (item._type === 'line') {
    return `<p>${item.text}</p>`
  }
  return tableToHtml(item)
}

function pageToHtml(page: Page): string {
  return page.items.reduce((acc, item) => acc + itemToHtml(item), '')
}

function sectionToHtml(section: LabeledSection) {
  const sectionHtml = section.items.map((item) => itemToHtml(item)).join('<br/>')
  return `<section id="${section.label}"><h2>Section: ${strings.camelcaseToSentenceCase(
    section.label,
  )}</h2>${sectionHtml}</section>`
}

export function jsonToHtml(pages: Page[]): string {
  const sections = pages.flatMap((p) => p.sections ?? [])
  const sectionsHtml = sections.reduce((acc, section) => acc + sectionToHtml(section), '')
  return sectionsHtml + '<br/>' + pages.reduce((acc, page) => acc + pageToHtml(page), '')
}
