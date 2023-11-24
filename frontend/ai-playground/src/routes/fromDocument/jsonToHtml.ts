import type {BlockItem, LabeledSection, Page, Row, Table} from '@cozemble/backend-aws-ocr-types'
import {strings} from '@cozemble/lang-util'

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

function itemToHtml(item: BlockItem, paragraphCounter: Counter, wordClasses: WordClass[]): string {
    if (item._type === 'line') {
        const paragraphNumber = `para-${paragraphCounter()}`
        const text = wordClasses.filter((wc) => wc.paragraphNumber === paragraphNumber).reduce((acc, wc) => {
            const word = wc.word
            return acc.replace(word, `<span class="${wc.clazz}">${word}</span>`)
        }, item.text)
        return `<p id="${paragraphNumber}">${text}</p>`
    }
    return tableToHtml(item)
}

function pageToHtml(page: Page, paragraphCounter: Counter, wordClasses: WordClass[]): string {
    return page.items.reduce((acc, item) => acc + itemToHtml(item, paragraphCounter, wordClasses), '')
}

function sectionToHtml(section: LabeledSection, paragraphCounter: Counter, wordClasses: WordClass[]) {
    const sectionHtml = section.items.map((item) => itemToHtml(item, paragraphCounter, wordClasses)).join('<br/>')
    return `<section id="${section.label}"><h2>Section: ${strings.camelcaseToSentenceCase(
        section.label,
    )}</h2>${sectionHtml}</section>`
}

type Counter = () => number

function counter(): Counter {
    let count = 0
    return () => {
        count++
        return count
    }
}

export type WordClass = { paragraphNumber: string; word: string, clazz: string }

export function jsonToHtml(pages: Page[], wordClasses = [] as WordClass[]): string {
    const sections = pages.flatMap((p) => p.sections ?? [])
    const paragraphCounter = counter()
    const sectionsHtml = sections.reduce((acc, section) => acc + sectionToHtml(section, paragraphCounter, wordClasses), '')
    return sectionsHtml + '<br/>' + pages.reduce((acc, page) => acc + pageToHtml(page, paragraphCounter, wordClasses), '')
}
