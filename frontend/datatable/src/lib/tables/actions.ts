import type { Model } from '@cozemble/model-core'
import { modelFns } from '@cozemble/model-api'

export interface AddTableAction {
  _type: 'add.table.action'
  name: string
  pluralName: string
}

export function addTableAction(name: string, pluralName: string): AddTableAction {
  return {
    _type: 'add.table.action',
    name,
    pluralName,
  }
}

export type TablesAction = AddTableAction

export function tablesActionReducer(tables: Model[], action: TablesAction): Model[] {
  if (action._type === 'add.table.action') {
    return [...tables, modelFns.newInstance(action.name)]
  }
  throw new Error(`Unknown action`)
}
