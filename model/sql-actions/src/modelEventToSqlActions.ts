import type { Model, ModelEvent } from '@cozemble/model-core'
import { constraints, makeSqlActions, type SqlAction, SqlActions } from '@cozemble/sql-actions'
import type {
  BooleanPropertyChanged,
  ModelCreated,
  ModelRenamed,
  PropertyRenamed,
  RelationshipAdded,
} from '@cozemble/model-event-sourced'
import { mandatory, strings } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'

export interface ModelEventToSqlAction<E extends ModelEvent> {
  eventToSqlAction: (
    sqlActions: SqlActions,
    allModels: Model[],
    event: E,
    oldModel: Model | null,
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
  apply: (allModels: Model[], event: ModelEvent, oldModel: Model | null): SqlAction[] => {
    const descriptor = registeredModelEventToSqlActions.get(event._type)
    if (descriptor) {
      return descriptor.eventToSqlAction(sqlActions, allModels, event, oldModel)
    } else {
      throw new Error(`Unknown event type: ${event._type}`)
    }
  },
}

export type OnNewTableExtension = (sqlActions: SqlActions, modelName: string) => SqlAction[]

const onNewTableExtensions: OnNewTableExtension[] = []

export const sqlActionExtensions = {
  onNewTable: (extension: OnNewTableExtension) => {
    onNewTableExtensions.push(extension)
  },
}

sqlActionExtensions.onNewTable((sqlActions, modelName) => {
  return [
    sqlActions.addColumn(modelName, 'is_deleted', 'boolean'),
    sqlActions.addColumn(modelName, 'created_by'),
    sqlActions.addColumn(modelName, 'created_at', 'timestamp'),
    sqlActions.addColumn(modelName, 'updated_at', 'timestamp'),
  ]
})

modelEventToSqlActions.register<ModelCreated>('model.created.event', {
  eventToSqlAction: (sqlActions, allModels, event, _oldModel) => {
    return [
      sqlActions.newTable(event.modelName.value),
      ...onNewTableExtensions.flatMap((extension) => extension(sqlActions, event.modelName.value)),
    ]
  },
})

function mandatoryOldModel(oldModel: Model | null): Model {
  return mandatory(oldModel, 'old model required, but was null')
}

modelEventToSqlActions.register<ModelRenamed>('model.renamed.event', {
  eventToSqlAction: (sqlActions, allModels, event, oldModel) => {
    return [
      sqlActions.renameModel(mandatoryOldModel(oldModel).name.value, event.newModelName.value),
    ]
  },
})

modelEventToSqlActions.register<PropertyRenamed>('property.renamed.event', {
  eventToSqlAction: (sqlActions, allModels, event, oldModel) => {
    const model = modelFns.findById(allModels, event.modelId)
    const property = modelFns.propertyWithId(mandatoryOldModel(oldModel), event.propertyId)
    return [
      sqlActions.renameColumn(model.name.value, property.name.value, event.newPropertyName.value),
    ]
  },
})

modelEventToSqlActions.register<RelationshipAdded>('relationship.added.event', {
  eventToSqlAction: (sqlActions, allModels, event, _oldModel) => {
    if (event.cardinality === 'one') {
      const fkColumnName = `${event.childModel.name.value} ID`
      const fkConstraintName = strings.camelize(
        `${event.parentModel.name.value}${event.childModel.name.value}Fk`,
      )
      return [
        sqlActions.addColumn(event.parentModel.name.value, fkColumnName),
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
  eventToSqlAction: (sqlActions, allModels, event, _oldModel) => {
    const model = modelFns.findById(allModels, event.modelId)
    const property = modelFns.propertyWithId(model, event.propertyId)
    if (event.booleanPropertyName === 'required') {
      if (event.newValue === true) {
        return [sqlActions.makeColumnNonNullable(model.name.value, property.name.value)]
      } else {
        return [sqlActions.makeColumnNullable(model.name.value, property.name.value)]
      }
    }
    if (event.booleanPropertyName === 'unique') {
      const constraintName = strings.camelize(`${model.name.value}${property.name.value}Unique`)
      const constraint = constraints.unique(constraintName)
      if (event.newValue === true) {
        return [sqlActions.addColumnConstraint(model.name.value, property.name.value, constraint)]
      } else {
        return [sqlActions.dropColumnConstraint(model.name.value, property.name.value, constraint)]
      }
    }
    return []
  },
})
