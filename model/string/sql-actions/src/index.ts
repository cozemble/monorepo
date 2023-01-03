import {modelEventToSqlActions} from "@cozemble/model-sql-actions";
import {NewStringPropertyModelEvent} from "@cozemble/model-string-core";
import {modelFns} from "@cozemble/model-api";

export function registerStringPropertyEventToSqlActions() {
    modelEventToSqlActions.register<NewStringPropertyModelEvent>("new.string.property.model.event", {
        eventToSqlAction: (sqlActions, allModels, modelId, event) => {
            const model = modelFns.findById(allModels, modelId)
            const property = modelFns.propertyWithId(model, event.propertyId)
            return [sqlActions.addColumn(model.name, property.name)]
        }
    })

}