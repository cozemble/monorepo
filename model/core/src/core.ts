import {mandatory, Option} from "@cozemble/lang-util";

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

export interface PropertyDescriptor<P = any, V = any, > {
    _type: "property.descriptor"
    propertyType: PropertyType
    name: DottedName
    newProperty: () => P

    validateProperty(property: P): Map<string, string>

    randomValue: () => V

    validateValue: (property: P, value: V | null) => string[]

    setValue(property: P, record: DataRecord, value: V | null): DataRecord

    getValue(property: P, record: DataRecord): V | null
}

export interface Property<T = any> {
    _type: PropertyType
    id: string
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

export const registeredProperties: PropertyDescriptor[] = []

export const propertyDescriptors = {
    register: (descriptor: PropertyDescriptor) => {
        if (!registeredProperties.find(p => propertyTypeFns.equals(p.propertyType, descriptor.propertyType))) {
            registeredProperties.push(descriptor)
        }
    },
    get: (propertyType: PropertyType): PropertyDescriptor | null => {
        return registeredProperties.find(p => propertyTypeFns.equals(p.propertyType, propertyType)) ?? null
    },
    mandatory: (p: Property | PropertyType): PropertyDescriptor => {
        const propertyType = p._type === 'property.type' ? p : p._type
        return mandatory(registeredProperties.find(p => propertyTypeFns.equals(p.propertyType, propertyType)), `No property descriptor registered for property type ${propertyType.type}`)
    },
    list: () => {
        return registeredProperties
    }
}

export type ModelOption = Option<Model>
export type PropertyOption = Option<Property>