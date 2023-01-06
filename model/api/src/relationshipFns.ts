import {Cardinality, ModelId, Relationship} from "@cozemble/model-core";
import {RelationshipName} from "@cozemble/model-core";
import {relationshipNameFns} from "@cozemble/model-core";

export const relationshipFns = {
    newInstance: (name: string|RelationshipName, relatedModelId: ModelId, cardinality: Cardinality): Relationship => {
        return {
            _type: cardinality === "one" ? "has.one.relationship" : "has.many.relationship",
            modelId: relatedModelId,
            name: typeof name === "string" ? relationshipNameFns.newInstance(name) : name
        }

    }
}