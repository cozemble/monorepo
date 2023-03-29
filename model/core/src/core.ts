import { clock, type Option, uuids } from '@cozemble/lang-util'

interface TinyValue<T = string> {
  value: T
}

export interface PropertyType extends TinyValue {
  _type: 'property.type'
}

export const propertyTypeFns = {
  newInstance: (value: string): PropertyType => {
    return {
      _type: 'property.type',
      value,
    }
  },
  equals: (a: PropertyType, b: PropertyType): boolean => {
    return a.value === b.value
  },
}

export interface PropertyId extends TinyValue {
  _type: 'property.id'
}

export interface PropertyName extends TinyValue {
  _type: 'property.name'
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

export interface ModelId extends TinyValue {
  _type: 'model.id'
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

export type Cardinality = 'one' | 'many'

export interface NestedModelId extends TinyValue {
  _type: 'nested.model.id'
}

export interface NestedModelName extends TinyValue {
  _type: 'nested.model.name'
}

export const nestedModelNameFns = {
  newInstance: (value: string): NestedModelName => {
    return {
      _type: 'nested.model.name',
      value,
    }
  },
}

export interface NestedModel {
  _type: 'nested.model'
  id: NestedModelId
  name: NestedModelName
  cardinality: Cardinality
  modelId: ModelId
}

export interface ModelName extends TinyValue {
  _type: 'model.name'
}

export const modelNameFns = {
  newInstance: (value: string): ModelName => {
    return {
      _type: 'model.name',
      value,
    }
  },
}

export interface ModelReferenceName extends TinyValue {
  _type: 'model.reference.name'
}

export interface ModelReferenceId extends TinyValue {
  _type: 'model.reference.id'
}

export interface InlinedModelReferenceId extends TinyValue {
  _type: 'inlined.model.reference.id'
}

export interface InlinedModelReferenceName extends TinyValue {
  _type: 'inlined.model.reference.name'
}

export interface ModelReference {
  _type: 'model.reference'
  id: ModelReferenceId
  name: ModelReferenceName
  modelId: ModelId
  cardinality: Cardinality
  inverseName?: ModelReferenceName
}

export interface InlinedModelReference {
  _type: 'inlined.model.reference'
  id: InlinedModelReferenceId
  name: InlinedModelReferenceName
  modelId: ModelId
  cardinality: Cardinality
}

export type ModelSlot = Property | ModelReference | InlinedModelReference

export interface Model {
  _type: 'model'
  id: ModelId
  parentModelId?: ModelId
  name: ModelName
  slots: ModelSlot[]
  nestedModels: NestedModel[]
}

export type ModelPathElement = NestedModel | Property | ModelReference | InlinedModelReference

export interface ModelPath<E extends ModelPathElement> {
  _type: 'model.path'
  lastElement: E
  parentElements: ModelPathElement[]
}

export interface DataRecordId extends TinyValue {
  _type: 'data.record.id'
}

export interface TimestampEpochMillis extends TinyValue<number> {
  _type: 'timestamp.epoch.millis'
}

export function timestampEpochMillis(value = clock.now().getTime()): TimestampEpochMillis {
  return {
    _type: 'timestamp.epoch.millis',
    value,
  }
}

export interface UserId extends TinyValue {
  _type: 'user.id'
}

export interface DataRecord {
  _type: 'data.record'
  id: DataRecordId
  modelId: ModelId
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

export interface NestedRecordArrayPathElement {
  _type: 'nested.record.array.path.element'
  nestedModel: NestedModel
  recordReference: RecordReference
}

export function nestedRecordArrayPathElement(
  nestedModel: NestedModel,
  index: number,
): NestedRecordArrayPathElement {
  return {
    _type: 'nested.record.array.path.element',
    nestedModel,
    recordReference: {
      _type: 'by.index.record.reference',
      index,
    },
  }
}

export type DataRecordPathElement =
  | NestedRecordArrayPathElement
  | NestedModel
  | ModelReference
  | InlinedModelReference

export interface DataRecordPath {
  _type: 'data.record.path'
  parentElements: DataRecordPathElement[]
  lastElement: Property
}

export interface DottedName extends TinyValue {
  _type: 'dotted.name'
}

export type ModelOption = Option<Model>
export type PropertyOption = Option<Property>

export function emptyModel(name: string | ModelName): Model {
  name = typeof name === 'string' ? modelNameFns.newInstance(name) : name
  return {
    _type: 'model',
    id: { _type: 'model.id', value: uuids.v4() },
    name,
    slots: [],
    nestedModels: [],
  }
}

export interface DottedPath extends TinyValue {
  _type: 'dotted.path'
  partType: 'id' | 'name'
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
