import {Cardinality, DataRecord, Model, ModelId, ModelOption, Property} from "@cozemble/model-core";
import {clock, options, uuids} from "@cozemble/lang-util";
import {PropertyOption} from "@cozemble/model-core/dist/esm";
import {propertyFns} from "./propertyFns";

export const modelOptions = {
    withProperty(p: Property): ModelOption {
        return this.withProperties(p)
    },
    withProperties(...ps: Property[]): ModelOption {
        return model =>
            ({...model, properties: [...model.properties, ...ps]})
    },
    withParentModelId(parentModelId: ModelId): ModelOption {
        return model =>
            ({...model, parentModelId})
    }
}
export let modelFns = {
    newInstance: (name: string, ...opts: ModelOption[]): Model => {
        return options.apply({
            _type: "model",
            id: {
                _type: "model.id",
                id: uuids.v4()
            },
            name,
            properties: [],
            relationships: []
        }, ...opts)
    },
    setPropertyValue<T = any>(model: Model, property: Property<T>, value: T | null, record: DataRecord): DataRecord {
        return {
            ...property.setValue(record, value),
            updatedMillis: {_type: "timestamp.epoch.millis", value: clock.now().getTime()}
        }
    },
    addRelationship(cardinality: Cardinality, modelName: string, relationshipName: string, model: Model): { model: Model, relatedModel: Model } {
        const relatedModel = modelFns.newInstance(modelName, modelOptions.withParentModelId(model.id))
        model = {
            ...model,
            relationships: [
                ...model.relationships,
                {
                    _type: cardinality === "one" ? "has.one.relationship" : "has.many.relationship",
                    modelId: relatedModel.id,
                    name: relationshipName
                }
            ]
        }
        return {model, relatedModel}
    },
    addProperty(model: Model, ...propertyOpts: PropertyOption[]): Model {
        const property = propertyFns.newInstance(...propertyOpts)
        return {
            ...model,
            properties: [...model.properties, property]
        }
    }
}
