import {
    Cardinality,
    ModelEvent,
    ModelEventDescriptor,
    modelEventDescriptors,
    ModelId,
    ModelName,
    PropertyId,
    propertyIdFns,
    timestampEpochMillis
} from "@cozemble/model-core";
import {relationshipFns} from "@cozemble/model-api";
import {PropertyName} from "@cozemble/model-core/dist/esm";

export interface ModelRenamed extends ModelEvent {
    _type: "model.renamed.event"
    oldModelName: ModelName
    newModelName: ModelName
}

function modelRenamed(oldModelName: ModelName, newModelName: ModelName): ModelRenamed {
    return {
        _type: "model.renamed.event",
        timestamp: timestampEpochMillis(),
        oldModelName,
        newModelName
    }
}

const modelRenamedDescriptor: ModelEventDescriptor<ModelRenamed> = {
    _type: "model.event.descriptor",
    modelEventType: "model.renamed.event",
    applyEvent: (model, event) => {
        return {
            ...model,
            name: event.newModelName
        }
    }
}

export interface PropertyRenamed extends ModelEvent {
    _type: "property.renamed.event"
    propertyId: PropertyId
    modelName: ModelName
    oldPropertyName: PropertyName
    newPropertyName: PropertyName
}

function propertyRenamed(modelName: ModelName, propertyId: PropertyId, oldPropertyName: PropertyName, newPropertyName: PropertyName): PropertyRenamed {
    return {
        _type: "property.renamed.event",
        timestamp: timestampEpochMillis(),
        propertyId,
        modelName,
        oldPropertyName,
        newPropertyName
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
                        name: event.newPropertyName
                    }
                } else {
                    return property
                }
            })
        }
    }
}

export interface RelationshipAdded extends ModelEvent {
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

export interface ModelCreated extends ModelEvent {
    _type: "model.created.event"
    modelName: ModelName
}

function modelCreated(modelName: ModelName): ModelCreated {
    return {
        _type: "model.created.event",
        timestamp: timestampEpochMillis(),
        modelName
    }
}


modelEventDescriptors.register(modelRenamedDescriptor)
modelEventDescriptors.register(propertyRenamedDescriptor)
modelEventDescriptors.register(relationshipAddedDescriptor)

export const coreModelEvents = {
    modelRenamed,
    propertyRenamed,
    relationshipAdded,
    modelCreated
}
