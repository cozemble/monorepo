import {Cardinality, ModelId, Relationship} from "@cozemble/model-core";

export const relationshipFns = {
    newInstance: (name: string, relatedModelId: ModelId, cardinality: Cardinality): Relationship => {
        return {
            _type: cardinality === "one" ? "has.one.relationship" : "has.many.relationship",
            modelId: relatedModelId,
            name: name
        }

    }
}