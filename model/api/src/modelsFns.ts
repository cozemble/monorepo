import {
    Cardinality,
    DataRecord,
    emptyModel,
    Model,
    ModelId,
    ModelOption,
    Property,
    propertyDescriptors,
    PropertyOption
} from "@cozemble/model-core";
import {clock, options} from "@cozemble/lang-util";
import {propertyFns} from "./propertyFns";
import {relationshipFns} from "./relationshipFns";

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
        return options.apply(emptyModel(name), ...opts)
    },
    setPropertyValue<T = any>(model: Model, property: Property<T>, value: T | null, record: DataRecord): DataRecord {
        return {
            ...propertyDescriptors.mandatory(property).setValue(property, record, value),
            updatedMillis: {_type: "timestamp.epoch.millis", value: clock.now().getTime()}
        }
    },
    addRelationship(cardinality: Cardinality, modelName: string, relationshipName: string, model: Model): { model: Model, relatedModel: Model } {
        const relatedModel = modelFns.newInstance(modelName, modelOptions.withParentModelId(model.id))
        model = {
            ...model,
            relationships: [
                ...model.relationships,
                relationshipFns.newInstance(relationshipName, relatedModel.id, cardinality)
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
    },
    validate(model: Model, record: DataRecord): Map<string, string[]> {
        return model.properties.reduce((errors, property) => {
            const value = propertyDescriptors.mandatory(property).getValue(property, record)
            const propertyErrors = propertyDescriptors.mandatory(property).validateValue(property, value)
            if (propertyErrors.length > 0) {
                errors.set(property.id.id, propertyErrors)
            }
            return errors
        }, new Map<string, string[]>())
    }
}
