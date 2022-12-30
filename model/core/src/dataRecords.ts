import {uuids} from "@cozemble/lang-util";
import {DataRecord, Model, models} from "./core";

export const dataRecords = {
    random: (model: Model): DataRecord => {
        const record: DataRecord = {
            _type: "data.record",
            id: {_type: "data.record.id", id: uuids.v4()},
            modelId: model.id,
            createdBy: {_type: "user.id", id: "random"},
            createdMillis: {_type: "timestamp.epoch.millis", value: Date.now()},
            updatedMillis: {_type: "timestamp.epoch.millis", value: Date.now()},
            values: {}
        }
        return model.properties.reduce((record, property) => models.setPropertyValue(model, property, property.randomValue(), record), record)
    }
}