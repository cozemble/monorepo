import {DataRecord, Model, Property} from "@cozemble/model-core";
import {clock, uuids} from "@cozemble/lang-util";

export let modelFns = {
    newInstance: (name: string, ...properties: Property[]): Model => {
        return {
            _type: "model",
            id: {
                _type: "model.id",
                id: uuids.v4()
            },
            name,
            properties
        }
    },
    setPropertyValue<T = any>(model: Model, property: Property<T>, value: T | null, record: DataRecord): DataRecord {
        return {
            ...property.setValue(record, value),
            updatedMillis: {_type: "timestamp.epoch.millis", value: clock.now().getTime()}
        }
    }
}
