import { modelFns } from '@cozemble/model-api'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { ModelId } from '@cozemble/model-core'
import { modelOptions } from '@cozemble/model-api'

export interface AddTableAction {
  _type: 'add.table.action'
  modelId: ModelId
  name: string
  pluralName: string
}

export function addTableAction(modelId: ModelId, name: string, pluralName: string): AddTableAction {
  return {
    _type: 'add.table.action',
    modelId,
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
    const newModel = modelFns.newInstance(action.name, modelOptions.withProperty(`Field 1`))
    newModel.id = action.modelId
    return [...tables, eventSourcedModelFns.newInstance(newModel)]
  }
  throw new Error(`Unknown action`)
}
