import { modelFns } from '@cozemble/model-api'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'

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

export function tablesActionReducer(
  tables: EventSourcedModel[],
  action: TablesAction,
): EventSourcedModel[] {
  if (action._type === 'add.table.action') {
    return [...tables, eventSourcedModelFns.newInstance(modelFns.newInstance(action.name))]
  }
  throw new Error(`Unknown action`)
}
