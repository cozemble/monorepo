import {Model, ModelEvent, ModelId} from "@cozemble/model-core";
import {constraints, makeSqlActions, SqlAction, SqlActions} from "@cozemble/sql-actions";
import {ModelCreated, ModelRenamed, PropertyRenamed} from "@cozemble/model-event-sourced";
import {RelationshipAdded} from "@cozemble/model-event-sourced/dist/esm";
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
        return [sqlActions.newTable(event.modelName)]
    }
})

modelEventToSqlActions.register<ModelRenamed>("model.renamed.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        return [sqlActions.renameModel(event.oldModelName, event.newModelName)]
    }
})

modelEventToSqlActions.register<PropertyRenamed>("property.renamed.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        return [sqlActions.renameColumn(event.modelName, event.oldPropertyName, event.newPropertyName)]
    }
})

modelEventToSqlActions.register<RelationshipAdded>("relationship.added.event", {
    eventToSqlAction: (sqlActions, allModels, modelId, event) => {
        if (event.cardinality === "one") {
            const fromModel = modelFns.findById(allModels, modelId)
            const toModel = modelFns.findById(allModels, event.relatedModelId)
            const fkColumnName = `${toModel.name} ID`
            const fkConstraintName = strings.camelize(`${fromModel.name}${toModel.name}Fk`)
            return [
                sqlActions.newTable(toModel.name),
                sqlActions.addColumn(fromModel.name, fkColumnName),
                sqlActions.changeColumnType(fromModel.name, fkColumnName, "text", "integer"),
                sqlActions.addColumnConstraint(fromModel.name, fkColumnName, constraints.fk(toModel.name, fkConstraintName))
            ]
        } else {
            const fromModel = modelFns.findById(allModels, modelId) // customer
            const toModel = modelFns.findById(allModels, event.relatedModelId) // address
            const fkColumnName = `${fromModel.name} ID`
            const fkConstraintName = strings.camelize(`${fromModel.name}${toModel.name}Fk`)
            return [
                sqlActions.newTable(toModel.name),
                sqlActions.addColumn(toModel.name, fkColumnName),
                sqlActions.changeColumnType(toModel.name, fkColumnName, "text", "integer"),
                sqlActions.addColumnConstraint(toModel.name, fkColumnName, constraints.fk(fromModel.name, fkConstraintName))
            ]
        }
    }
})
