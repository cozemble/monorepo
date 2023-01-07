import { clock, Option, uuids } from '@cozemble/lang-util'

export interface PropertyType {
  _type: 'property.type'
  type: string
}

export const propertyTypeFns = {
  newInstance: (type: string): PropertyType => {
    return {
      _type: 'property.type',
      type,
    }
  },
  equals: (a: PropertyType, b: PropertyType): boolean => {
    return a.type === b.type
  },
}

export interface PropertyId {
  _type: 'property.id'
  id: string
}

export interface PropertyName {
  _type: 'property.name'
  value: string
}

export const propertyNameFns = {
  newInstance: (value: string): PropertyName => {
    return {
      _type: 'property.name',
      value,
    }
  },
}

export interface Property<T = any> {
  _type: PropertyType
  id: PropertyId
  version: number
  name: PropertyName
}

export interface ModelId {
  _type: 'model.id'
  id: string
}

export interface ModelIdAndName {
  _type: 'model.id.and.name'
  id: ModelId
  name: ModelName
}

export const modelIdAndNameFns = {
  newInstance: (id: ModelId, name: ModelName): ModelIdAndName => {
    return {
      _type: 'model.id.and.name',
      id,
      name,
    }
  },
}

export interface HasOneRelationship {
  _type: 'has.one.relationship'
  modelId: ModelId
  name: RelationshipName
}

export interface HasManyRelationship {
  _type: 'has.many.relationship'
  modelId: ModelId
  name: RelationshipName
}

export type Cardinality = 'one' | 'many'
export type Relationship = HasOneRelationship | HasManyRelationship

export interface ModelName {
  _type: 'model.name'
  value: string
}

export interface RelationshipName {
  _type: 'relationship.name'
  value: string
}

export const relationshipNameFns = {
  newInstance: (value: string): RelationshipName => {
    return {
      _type: 'relationship.name',
      value,
    }
  },
}

export const modelNameFns = {
  newInstance: (value: string): ModelName => {
    return {
      _type: 'model.name',
      value,
    }
  },
}

export interface Model {
  _type: 'model'
  id: ModelId
  parentModelId?: ModelId
  name: ModelName
  properties: Property[]
  relationships: Relationship[]
}

export interface DataRecordId {
  _type: 'data.record.id'
  id: string
}

export interface TimestampEpochMillis {
  _type: 'timestamp.epoch.millis'
  value: number
}

export function timestampEpochMillis(value = clock.now().getTime()): TimestampEpochMillis {
  return {
    _type: 'timestamp.epoch.millis',
    value,
  }
}

export interface UserId {
  _type: 'user.id'
  id: string
}

export interface DataRecord {
  _type: 'data.record'
  modelId: ModelId
  id: DataRecordId
  createdMillis: TimestampEpochMillis
  updatedMillis: TimestampEpochMillis
  createdBy: UserId
  values: { [key: string]: any }
}

export type DataRecordPathElement = Property

export interface DataRecordPath<T = any> {
  _type: 'data.record.path'
  parentElements: DataRecordPathElement[]
  property: Property<T>

  getValue(record: DataRecord): T | null

  setValue(record: DataRecord, t: T | null): DataRecord
}

export interface DottedName {
  _type: 'dotted.name'
  name: string
}

export type ModelOption = Option<Model>
export type PropertyOption = Option<Property>

export function emptyModel(name: ModelName): Model {
  return {
    _type: 'model',
    id: { _type: 'model.id', id: uuids.v4() },
    name,
    properties: [],
    relationships: [],
  }
}
