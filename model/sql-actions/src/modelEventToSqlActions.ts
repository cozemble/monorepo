import {Model, ModelEvent, ModelId} from "@cozemble/model-core";
import {constraints, makeSqlActions, SqlAction, SqlActions} from "@cozemble/sql-actions";
import {ModelCreated, ModelRenamed, PropertyRenamed} from "@cozemble/model-event-sourced";
import {RelationshipAdded} from "@cozemble/model-event-sourced";
import {modelFns} from "@cozemble/model-api";
import {strings} from "@cozemble/lang-util";

export interface ModelEventToSqlAction<E extends ModelEvent> {
    eventToSqlAction: (sqlActions: SqlActions, allModels: Model[], modelId: ModelId, event: E) => SqlAction[]
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
    }
}


modelEventToSqlActions.register<ModelCreated>("model.created.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        return [sqlActions.newTable(event.modelName.value)]
    }
})

modelEventToSqlActions.register<ModelRenamed>("model.renamed.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        return [sqlActions.renameModel(event.oldModelName.value, event.newModelName.value)]
    }
})

modelEventToSqlActions.register<PropertyRenamed>("property.renamed.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        return [sqlActions.renameColumn(event.modelName.value, event.oldPropertyName.value, event.newPropertyName.value)]
    }
})

modelEventToSqlActions.register<RelationshipAdded>("relationship.added.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        if (event.cardinality === "one") {
            const fromModel = modelFns.findById(allModels, modelId)
            const toModel = modelFns.findById(allModels, event.relatedModelId)
            const fkColumnName = `${toModel.name.value} ID`
            const fkConstraintName = strings.camelize(`${fromModel.name.value}${toModel.name.value}Fk`)
            return [
                sqlActions.newTable(toModel.name.value),
                sqlActions.addColumn(fromModel.name.value, fkColumnName),
                sqlActions.changeColumnType(fromModel.name.value, fkColumnName, "text", "integer"),
                sqlActions.addColumnConstraint(fromModel.name.value, fkColumnName, constraints.fk(toModel.name.value, fkConstraintName))
            ]
        } else {
            const fromModel = modelFns.findById(allModels, modelId) // customer
            const toModel = modelFns.findById(allModels, event.relatedModelId) // address
            const fkColumnName = `${fromModel.name.value} ID`
            const fkConstraintName = strings.camelize(`${fromModel.name.value}${toModel.name.value}Fk`)
            return [
                sqlActions.newTable(toModel.name.value),
                sqlActions.addColumn(toModel.name.value, fkColumnName),
                sqlActions.changeColumnType(toModel.name.value, fkColumnName, "text", "integer"),
                sqlActions.addColumnConstraint(toModel.name.value, fkColumnName, constraints.fk(fromModel.name.value, fkConstraintName))
            ]
        }
    }
})
