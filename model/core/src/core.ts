import { clock, type Option, uuids } from '@cozemble/lang-util'

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
  value: string
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

export interface Property {
  _type: 'property'
  propertyType: PropertyType
  id: PropertyId
  version: number
  name: PropertyName
  required: boolean
  unique: boolean
}

export interface ModelId {
  _type: 'model.id'
  value: string
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
  _type: 'relationship'
  subType: 'has.one.relationship'
  id: RelationshipId
  name: RelationshipName
  modelId: ModelId
}

export interface HasManyRelationship {
  _type: 'relationship'
  subType: 'has.many.relationship'
  id: RelationshipId
  name: RelationshipName
  modelId: ModelId
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

export interface RelationshipId {
  _type: 'relationship.id'
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

export const relationshipIdFns = {
  newInstance: (value: string = uuids.v4()): RelationshipId => {
    return {
      _type: 'relationship.id',
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

export type ModelPathElement = Relationship | Property

export interface ModelPath<E extends ModelPathElement> {
  _type: 'model.path'
  lastElement: E
  parentElements: ModelPathElement[]
}

export interface DataRecordId {
  _type: 'data.record.id'
  value: string
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
  value: string
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

export interface ByIndexRecordReference {
  _type: 'by.index.record.reference'
  index: number
}

export type RecordReference = ByIndexRecordReference

export interface HasManyRelationshipPathElement {
  _type: 'has.many.relationship.path.element'
  relationship: HasManyRelationship
  recordReference: RecordReference
}

export function hasManyRelationshipPathElement(
  relationship: HasManyRelationship,
  index: number,
): HasManyRelationshipPathElement {
  return {
    _type: 'has.many.relationship.path.element',
    relationship,
    recordReference: {
      _type: 'by.index.record.reference',
      index,
    },
  }
}

export type DataRecordPathElement = HasManyRelationshipPathElement | HasOneRelationship

export interface DataRecordPath {
  _type: 'data.record.path'
  parentElements: DataRecordPathElement[]
  lastElement: Property
}

export interface DottedName {
  _type: 'dotted.name'
  name: string
}

export type ModelOption = Option<Model>
export type PropertyOption = Option<Property>

export function emptyModel(name: string | ModelName): Model {
  name = typeof name === 'string' ? modelNameFns.newInstance(name) : name
  return {
    _type: 'model',
    id: { _type: 'model.id', value: uuids.v4() },
    name,
    properties: [],
    relationships: [],
  }
}

export interface DottedPath {
  _type: 'dotted.path'
  partType: 'id' | 'name'
  value: string
}

export const dottedPathFns = {
  newInstance: (value: string, partType: 'id' | 'name' = 'id'): DottedPath => {
    return {
      _type: 'dotted.path',
      partType,
      value,
    }
  },
  dottedNamePath(value: string): DottedPath {
    return dottedPathFns.newInstance(value, 'name')
  },
  dottedIdPath(value: string): DottedPath {
    return dottedPathFns.newInstance(value, 'id')
  },
  split(dottedPath: DottedPath): string[] {
    return dottedPath.value.split('.')
  },
  equals: (a: DottedPath, b: DottedPath): boolean => {
    return a.value === b.value && a.partType === b.partType
  },
}

export type DataRecordAndPath = { parentElements: DataRecordPathElement[]; record: DataRecord }

function dataRecordAndPath(
  record: DataRecord,
  parentElements: DataRecordPathElement[],
): DataRecordAndPath {
  return {
    parentElements,
    record,
  }
}

export const dataRecordAndPathFns = {
  newInstance: dataRecordAndPath,
  prefix(element: DataRecordPathElement, recordAndPath: DataRecordAndPath): DataRecordAndPath {
    return dataRecordAndPath(recordAndPath.record, [element, ...recordAndPath.parentElements])
  },
}
