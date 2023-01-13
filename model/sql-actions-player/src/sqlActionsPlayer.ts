import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { type SqlAction } from '@cozemble/sql-actions'
import { modelEventToSqlActions } from '@cozemble/model-sql-actions'

export const sqlActionsPlayer = {
  play: (models: EventSourcedModel[]): SqlAction[] => {
    const allEvents = models.flatMap((m) => m.events)
    let result: SqlAction[] = []
    eventSourcedModelFns.playAll(allEvents, (event, oldModel, newModels) => {
      const actions = modelEventToSqlActions.apply(newModels, event, oldModel)
      result = [...result, ...actions]
    })
    return result
  },
}
