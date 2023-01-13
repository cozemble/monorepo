import { modelFns } from '@cozemble/model-api'
import { modelEventToSqlActions } from '@cozemble/model-sql-actions'
import { type NewStringPropertyModelEvent } from '@cozemble/model-string-core'

export function registerStringPropertyEventToSqlActions() {
  modelEventToSqlActions.register<NewStringPropertyModelEvent>('new.string.property.model.event', {
    eventToSqlAction: (sqlActions, allModels, event, _oldModel) => {
      const model = modelFns.findById(allModels, event.modelId)
      return [sqlActions.addColumn(model.name.value, event.propertyName.value)]
    },
  })
}
