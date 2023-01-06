import {modelEventToSqlActions} from "@cozemble/model-sql-actions";
import {NewStringPropertyModelEvent} from "@cozemble/model-string-core";

export function registerStringPropertyEventToSqlActions() {
    modelEventToSqlActions.register<NewStringPropertyModelEvent>("new.string.property.model.event", {
        eventToSqlAction: (sqlActions, allModels, modelId, event) => {
            return [sqlActions.addColumn(event.modelName.value, event.propertyName.value)]
        }
    })

}