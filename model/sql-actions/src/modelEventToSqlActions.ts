import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { constraints, makeSqlActions, type SqlAction, SqlActions } from '@cozemble/sql-actions'
import type {
  BooleanPropertyChanged,
  ModelCreated,
  ModelRenamed,
  PropertyRenamed,
  RelationshipAdded,
} from '@cozemble/model-event-sourced'
import { strings } from '@cozemble/lang-util'

export interface ModelEventToSqlAction<E extends ModelEvent> {
  eventToSqlAction: (
    sqlActions: SqlActions,
    allModels: Model[],
    modelId: ModelId,
    event: E,
  ) => SqlAction[]
}

const registeredModelEventToSqlActions = new Map<string, ModelEventToSqlAction<any>>()
let sqlActions = makeSqlActions()
export const modelEventToSqlActions = {
  setSqlActions: (newSqlActions: SqlActions) => {
    sqlActions = newSqlActions
  },
  register: <E extends ModelEvent>(eventType: string, descriptor: ModelEventToSqlAction<E>) => {
    registeredModelEventToSqlActions.set(eventType, descriptor)
  },
  apply: (allModels: Model[], modelId: ModelId, event: ModelEvent): SqlAction[] => {
    const descriptor = registeredModelEventToSqlActions.get(event._type)
    if (descriptor) {
      return descriptor.eventToSqlAction(sqlActions, allModels, modelId, event)
    } else {
      throw new Error(`Unknown event type: ${event._type}`)
    }
  },
}

modelEventToSqlActions.register<ModelCreated>('model.created.event', {
  eventToSqlAction: (sqlActions, allModels, modelId, event) => {
    return [sqlActions.newTable(event.modelName.value)]
  },
})

modelEventToSqlActions.register<ModelRenamed>('model.renamed.event', {
  eventToSqlAction: (sqlActions, allModels, modelId, event) => {
    return [sqlActions.renameModel(event.oldModelName.value, event.newModelName.value)]
  },
})

modelEventToSqlActions.register<PropertyRenamed>('property.renamed.event', {
  eventToSqlAction: (sqlActions, allModels, modelId, event) => {
    return [
      sqlActions.renameColumn(
        event.modelName.value,
        event.oldPropertyName.value,
        event.newPropertyName.value,
      ),
    ]
  },
})

modelEventToSqlActions.register<RelationshipAdded>('relationship.added.event', {
  eventToSqlAction: (sqlActions, allModels, modelId, event) => {
    if (event.cardinality === 'one') {
      const fkColumnName = `${event.childModel.name.value} ID`
      const fkConstraintName = strings.camelize(
        `${event.parentModel.name.value}${event.childModel.name.value}Fk`,
      )
      return [
        sqlActions.addColumn(event.parentModel.name.value, fkColumnName),
        sqlActions.changeColumnType(event.parentModel.name.value, fkColumnName, 'text', 'integer'),
        sqlActions.addColumnConstraint(
          event.parentModel.name.value,
          fkColumnName,
          constraints.fk(event.childModel.name.value, fkConstraintName),
        ),
      ]
    } else {
      const fkColumnName = `${event.parentModel.name.value} ID`
      const fkConstraintName = strings.camelize(
        `${event.parentModel.name.value}${event.childModel.name.value}Fk`,
      )
      return [
        sqlActions.addColumn(event.childModel.name.value, fkColumnName),
        sqlActions.changeColumnType(event.childModel.name.value, fkColumnName, 'text', 'integer'),
        sqlActions.addColumnConstraint(
          event.childModel.name.value,
          fkColumnName,
          constraints.fk(event.parentModel.name.value, fkConstraintName),
        ),
      ]
    }
  },
})

modelEventToSqlActions.register<BooleanPropertyChanged>('boolean.property.changed.event', {
  eventToSqlAction: (sqlActions, allModels, modelId, event) => {
    if (event.booleanPropertyName === 'required') {
      if (event.newValue === true) {
        return [sqlActions.makeColumnNonNullable(event.modelName.value, event.propertyName.value)]
      } else {
        return [sqlActions.makeColumnNullable(event.modelName.value, event.propertyName.value)]
      }
    }
    if (event.booleanPropertyName === 'unique') {
      const constraintName = strings.camelize(
        `${event.modelName.value}${event.propertyName.value}Unique`,
      )
      const constraint = constraints.unique(constraintName)
      if (event.newValue === true) {
        return [
          sqlActions.addColumnConstraint(
            event.modelName.value,
            event.propertyName.value,
            constraint,
          ),
        ]
      } else {
        return [
          sqlActions.dropColumnConstraint(
            event.modelName.value,
            event.propertyName.value,
            constraint,
          ),
        ]
      }
    }
    return []
  },
})
