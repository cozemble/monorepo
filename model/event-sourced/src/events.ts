import {
    Cardinality,
    ModelEvent,
    ModelEventDescriptor,
    modelEventDescriptors,
    ModelId,
    PropertyId,
    propertyIdFns,
    timestampEpochMillis
} from "@cozemble/model-core";
import {relationshipFns} from "@cozemble/model-api";

interface ModelRenamed extends ModelEvent {
    _type: "model.renamed.event"
    modelName: string
}

function modelRenamed(modelName: string): ModelRenamed {
    return {
        _type: "model.renamed.event",
        timestamp: timestampEpochMillis(),
        modelName
    }
}

const modelRenamedDescriptor: ModelEventDescriptor<ModelRenamed> = {
    _type: "model.event.descriptor",
    modelEventType: "model.renamed.event",
    applyEvent: (model, event) => {
        return {
            ...model,
            name: event.modelName
        }
    }
}

interface PropertyRenamed extends ModelEvent {
    _type: "property.renamed.event"
    propertyId: PropertyId
    propertyName: string
}

function propertyRenamed(propertyId: PropertyId, propertyName: string): PropertyRenamed {
    return {
        _type: "property.renamed.event",
        timestamp: timestampEpochMillis(),
        propertyId,
        propertyName
    }
}

const propertyRenamedDescriptor: ModelEventDescriptor<PropertyRenamed> = {
    _type: "model.event.descriptor",
    modelEventType: "property.renamed.event",
    applyEvent: (model, event) => {
        return {
            ...model,
            properties: model.properties.map(property => {
                if (propertyIdFns.equals(property.id, event.propertyId)) {
                    return {
                        ...property,
                        name: event.propertyName
                    }
                } else {
                    return property
                }
            })
        }
    }
}

interface RelationshipAdded extends ModelEvent {
    _type: "relationship.added.event"
    cardinality: Cardinality
    relationshipName: string
    relatedModelId: ModelId
}

function relationshipAdded(cardinality: Cardinality, relationshipName: string, relatedModelId: ModelId): RelationshipAdded {
    return {
        _type: "relationship.added.event",
        timestamp: timestampEpochMillis(),
        cardinality,
        relationshipName,
        relatedModelId
    }
}

const relationshipAddedDescriptor: ModelEventDescriptor<RelationshipAdded> = {
    _type: "model.event.descriptor",
    modelEventType: "relationship.added.event",
    applyEvent: (model, event) => {
        const newRelationship = relationshipFns.newInstance(event.relationshipName, event.relatedModelId, event.cardinality)
        return {
            ...model,
            relationships: [...model.relationships, newRelationship]
        }
    }
}

modelEventDescriptors.register(modelRenamedDescriptor)
modelEventDescriptors.register(propertyRenamedDescriptor)
modelEventDescriptors.register(relationshipAddedDescriptor)

export const coreModelEvents = {
    modelRenamed,
    propertyRenamed,
    relationshipAdded
}
