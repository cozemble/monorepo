import type { Page, Table } from '@cozemble/backend-aws-ocr-types'
import { strings } from '@cozemble/lang-util'

export interface Section {
  _type: 'section'
  id?: string
  lines: string[]
}

export interface TableAsObjects {
  _type: 'tableAsObjects'
  label: string
  objects: any[]
}

export type SectionOrTable = Section | Table | TableAsObjects

function removeNonAlphanumeric(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '')
}

function tableAsObjects(item: Table): TableAsObjects {
  const [header, ...rows] = item.rows
  return {
    _type: 'tableAsObjects',
    label: item.label || '',
    objects: rows.map((row) => {
      return row.cells.reduce((result, cell, index) => {
        result[strings.camelize(removeNonAlphanumeric(header.cells[index]))] = cell
        return result
      }, {} as any)
    }),
  }
}

export function toSectionedJson(pages: Page[]): SectionOrTable[] {
  const items = pages.flatMap((p) => p.items)
  let currentSection: Section | null = null
  let sectionIndex = 0
  return items.reduce((result, item) => {
    if (item._type === 'table') {
      if (currentSection !== null) {
        result.push(currentSection)
        currentSection = null
      }
      if (item.hasHeader) {
        result.push(tableAsObjects(item))
      } else {
        result.push(item)
      }
    } else if (item._type === 'line') {
      if (currentSection === null) {
        currentSection = {
          _type: 'section',
          id: `section-${sectionIndex}`,
          lines: [item.text],
        }
        sectionIndex++
      } else {
        currentSection.lines.push(item.text)
      }
    }
    return result
  }, [] as SectionOrTable[])
}
