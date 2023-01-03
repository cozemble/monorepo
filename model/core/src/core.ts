import {clock, Option, uuids} from "@cozemble/lang-util";

export interface PropertyType {
    _type: 'property.type'
    type: string
}

export const propertyTypeFns = {
    newInstance: (type: string): PropertyType => {
        return {
            _type: 'property.type',
            type
        }
    },
    equals: (a: PropertyType, b: PropertyType): boolean => {
        return a.type === b.type
    }
}

export interface PropertyId {
    _type: "property.id"
    id: string
}

export interface Property<T = any> {
    _type: PropertyType
    id: PropertyId
    version: number
    name: string
}

export interface ModelId {
    _type: "model.id"
    id: string
}

export interface HasOneRelationship {
    _type: "has.one.relationship"
    modelId: ModelId
    name: string
}

export interface HasManyRelationship {
    _type: "has.many.relationship"
    modelId: ModelId
    name: string
}

export type Cardinality = 'one' | 'many'
export type Relationship = HasOneRelationship | HasManyRelationship

export interface Model {
    _type: "model"
    id: ModelId
    parentModelId?: ModelId
    name: string
    properties: Property[]
    relationships: Relationship[]
}

export interface DataRecordId {
    _type: "data.record.id"
    id: string
}

export interface TimestampEpochMillis {
    _type: "timestamp.epoch.millis"
    value: number
}

export function timestampEpochMillis(value = clock.now().getTime()): TimestampEpochMillis {
    return {
        _type: "timestamp.epoch.millis",
        value
    }
}


export interface UserId {
    _type: "user.id"
    id: string
}

export interface DataRecord {
    _type: "data.record"
    modelId: ModelId
    id: DataRecordId
    createdMillis: TimestampEpochMillis
    updatedMillis: TimestampEpochMillis
    createdBy: UserId
    values: { [key: string]: any }
}

export type DataRecordPathElement = Property

export interface DataRecordPath<T = any> {
    _type: "data.record.path"
    parentElements: DataRecordPathElement[]
    property: Property<T>

    getValue(record: DataRecord): T | null

    setValue(record: DataRecord, t: T | null): DataRecord
}

export interface DottedName {
    _type: "dotted.name"
    name: string
}

export type ModelOption = Option<Model>
export type PropertyOption = Option<Property>

export function emptyModel(name: string): Model {
    return {
        _type: "model",
        id: {_type: "model.id", id: uuids.v4()},
        name,
        properties: [],
        relationships: []
    }
}
