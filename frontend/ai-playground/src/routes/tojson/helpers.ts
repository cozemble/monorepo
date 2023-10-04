import { derived, type Readable, type Writable } from 'svelte/store'
import type { Action } from '../ocr-as-html/ocrCorrectiveActions'
import type { Page } from '@cozemble/backend-aws-ocr-types'

export function derivedLabelledTables(actions: Writable<Action[]>): Readable<string[]> {
  return derived(actions, (actions) => {
    const labels = new Set<string>()
    for (const action of actions) {
      switch (action.action) {
        case 'labelTable':
          labels.add(action.tableLabel)
          break
      }
    }
    return Array.from(labels)
  })
}

export function tablesOnly(page: Page): Page {
  return { ...page, items: page.items.filter((item) => item._type === 'table') }
}
