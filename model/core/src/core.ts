import { clock, type Option, uuids } from '@cozemble/lang-util'
import { propertyDescriptors } from './propertyDescriptor'
import { SystemConfiguration } from './systemConfiguration'
import { TinyValue } from './TinyValue'

export type PropertyType = TinyValue<'property.type'>

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

export type PropertyId = TinyValue<'property.id'>

export type PropertyName = TinyValue<'property.name'>

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

export type ModelId = TinyValue<'model.id'>

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
  fromModel: (model: Model): ModelIdAndName => {
    return modelIdAndNameFns.newInstance(model.id, model.name)
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

export const nestedModelIdFns = {
  newInstance: (value = uuids.v4()): NestedModelId => {
    return {
      _type: 'nested.model.id',
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

export interface ModelPluralName extends TinyValue {
  _type: 'model.plural.name'
}

export const modelNameFns = {
  newInstance: (value: string): ModelName => {
    return {
      _type: 'model.name',
      value,
    }
  },
}

export const modelPluralNameFns = {
  newInstance: (value: string): ModelPluralName => {
    return {
      _type: 'model.plural.name',
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

export const modelReferenceNameFns = {
  newInstance: (value: string): ModelReferenceName => {
    return {
      _type: 'model.reference.name',
      value,
    }
  },
}

export const modelReferenceIdFns = {
  newInstance: (value: string = uuids.v4()): ModelReferenceId => {
    return {
      _type: 'model.reference.id',
      value,
    }
  },
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
  originModelId: ModelId
  referencedModelIds: ModelId[]
  inverse: boolean
  originCardinality: Cardinality
  referencedCardinality: Cardinality
}

export const modelReferenceValuePlaceholder = {
  _type: 'model.reference.value.placeholder',
}

export interface ReferencedRecord {
  _type: 'referenced.record'
  referencedModelId: ModelId
  referencedRecordId: DataRecordId
}

export interface ReferencedRecords {
  _type: 'referenced.records'
  referencedRecords: ReferencedRecord[]
}

export const referencedRecordsFns = {
  empty: (): ReferencedRecords => {
    return {
      _type: 'referenced.records',
      referencedRecords: [],
    }
  },
  addReference: (
    referencedRecords: ReferencedRecords,
    referencedModelId: ModelId,
    referencedRecordId: DataRecordId,
  ): ReferencedRecords => {
    return {
      _type: 'referenced.records',
      referencedRecords: [
        ...referencedRecords.referencedRecords,
        {
          _type: 'referenced.record',
          referencedModelId,
          referencedRecordId,
        },
      ],
    }
  },
  oneReference(modelId: ModelId, recordId: DataRecordId): ReferencedRecords {
    return {
      _type: 'referenced.records',
      referencedRecords: [
        {
          _type: 'referenced.record',
          referencedModelId: modelId,
          referencedRecordId: recordId,
        },
      ],
    }
  },
}

export const modelReferenceFns = {
  newInstance: (
    originModelId: ModelId,
    referencedModelIds: ModelId[],
    referenceName: ModelReferenceName | string,
    inverse = false,
    id = modelReferenceIdFns.newInstance(uuids.v4()),
    originCardinality: Cardinality = 'many',
    referencedCardinality: Cardinality = 'many',
  ): ModelReference => {
    const name =
      typeof referenceName === 'string'
        ? modelReferenceNameFns.newInstance(referenceName)
        : referenceName
    return {
      _type: 'model.reference',
      id,
      name,
      originModelId,
      inverse,
      referencedModelIds,
      originCardinality,
      referencedCardinality,
    }
  },
  validate: (modelReference: ModelReference): Map<string, string> => {
    const errors = new Map<string, string>()
    if (modelReference.referencedModelIds.length === 0) {
      errors.set('referencedModelIds', 'Required')
    }
    return errors
  },
  getReferencedModelId: (modelReference: ModelReference): ModelId | null => {
    return modelReference.inverse
      ? modelReference.originModelId
      : modelReferenceFns.oneReference(modelReference)
  },
  getCardinality(modelReference: ModelReference): Cardinality {
    return modelReference.inverse
      ? modelReference.referencedCardinality
      : modelReference.originCardinality
  },
  getReferencedCardinality(modelReference: ModelReference): Cardinality {
    return modelReference.inverse
      ? modelReference.originCardinality
      : modelReference.referencedCardinality
  },
  oneReference: (reference: ModelReference): ModelId | null => {
    return reference.referencedModelIds[0] ?? null
  },
  forwardModelReference: (
    originModelId: ModelId,
    toModel: Model,
    id = modelReferenceIdFns.newInstance(),
    originCardinality: Cardinality = 'many',
    referencedCardinality: Cardinality = 'many',
  ): ModelReference => {
    return modelReferenceFns.newInstance(
      originModelId,
      [toModel.id],
      modelReferenceNameFns.newInstance(toModel.name.value),
      false,
      id,
      originCardinality,
      referencedCardinality,
    )
  },
  inverseModelReference: (
    originModel: Model,
    toModel: Model,
    id = modelReferenceIdFns.newInstance(),
    originCardinality: Cardinality = 'many',
    referencedCardinality: Cardinality = 'many',
  ): ModelReference => {
    return modelReferenceFns.newInstance(
      originModel.id,
      [toModel.id],
      modelReferenceNameFns.newInstance(originModel.name.value),
      true,
      id,
      originCardinality,
      referencedCardinality,
    )
  },
  inverse(
    modelReference: ModelReference,
    referenceName: ModelReferenceName | string,
  ): ModelReference {
    const name =
      typeof referenceName === 'string'
        ? modelReferenceNameFns.newInstance(referenceName)
        : referenceName
    return { ...modelReference, inverse: true, name }
  },
  setOriginCardinality(modelReference: ModelReference, originCardinality: Cardinality) {
    return { ...modelReference, originCardinality }
  },
}

export interface InlinedModelReference {
  _type: 'inlined.model.reference'
  id: InlinedModelReferenceId
  name: InlinedModelReferenceName
  modelId: ModelId
  cardinality: Cardinality
}

export type ModelSlot = Property | ModelReference | InlinedModelReference
export type ModelSlotId = PropertyId | ModelReferenceId | InlinedModelReferenceId
export type ModelSlotName = PropertyName | ModelReferenceName | InlinedModelReferenceName

export const modelSlotFns = {
  getValue: (
    systemConfiguration: SystemConfiguration,
    slot: ModelSlot,
    record: DataRecord,
  ): any => {
    if (slot._type === 'property') {
      return propertyDescriptors
        .mandatory(slot.propertyType)
        .getValue(systemConfiguration, slot, record)
    }
    if (slot._type === 'model.reference') {
      return modelReferenceValuePlaceholder
    }
    throw new Error(`Can't get a value from model slot type: ${slot._type}`)
  },
}

export const modelSlotNameFns = {
  newInstance: (modelSlotType: string, value: string): ModelSlotName => {
    if (modelSlotType === 'property') {
      return propertyNameFns.newInstance(value)
    } else if (modelSlotType === 'model.reference') {
      return { _type: 'model.reference.name', value }
    }
    if (modelSlotType === 'inlined.model.reference') {
      return { _type: 'inlined.model.reference.name', value }
    }
    throw new Error(`Unknown model slot type: ${modelSlotType}`)
  },
}

export interface Model {
  _type: 'model'
  id: ModelId
  parentModelId?: ModelId
  name: ModelName
  pluralName: ModelPluralName
  slots: ModelSlot[]
  nestedModels: NestedModel[]
}

export type ModelPathElement = NestedModel | Property | ModelReference | InlinedModelReference

export const modelPathElementFns = {
  isLeafSlot: (modelSlot: ModelPathElement): boolean => {
    return modelSlot._type === 'property' || modelSlot._type === 'model.reference'
  },
}

export interface ModelPath<E extends ModelPathElement> {
  _type: 'model.path'
  lastElement: E
  parentElements: ModelPathElement[]
}

export interface DataRecordId extends TinyValue {
  _type: 'data.record.id'
}

export const dataRecordIdFns = {
  newInstance: (value = uuids.v4()): DataRecordId => {
    return {
      _type: 'data.record.id',
      value,
    }
  },
}

export type TimestampEpochMillis = TinyValue<'timestamp.epoch.millis', number>

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

export type DataRecordPathParentElement =
  | NestedRecordArrayPathElement
  | NestedModel
  | InlinedModelReference

export type LeafModelSlot = Property | ModelReference
export type LeafModelSlotId = PropertyId | ModelReferenceId

export interface DataRecordValuePath {
  _type: 'data.record.value.path'
  parentElements: DataRecordPathParentElement[]
  lastElement: LeafModelSlot
}

export interface DottedName extends TinyValue {
  _type: 'dotted.name'
}

export type ModelOption = Option<Model>
export type PropertyOption = Option<Property>

export function emptyModel(name: string | ModelName): Model {
  name = typeof name === 'string' ? modelNameFns.newInstance(name) : name
  const pluralName = modelPluralNameFns.newInstance(name.value)
  return {
    _type: 'model',
    id: { _type: 'model.id', value: uuids.v4() },
    name,
    pluralName,
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

export type DataRecordAndPath = {
  parentElements: DataRecordPathParentElement[]
  record: DataRecord
}

function dataRecordAndPath(
  record: DataRecord,
  parentElements: DataRecordPathParentElement[],
): DataRecordAndPath {
  return {
    parentElements,
    record,
  }
}

export const dataRecordAndPathFns = {
  newInstance: dataRecordAndPath,
  prefix(
    element: DataRecordPathParentElement,
    recordAndPath: DataRecordAndPath,
  ): DataRecordAndPath {
    return dataRecordAndPath(recordAndPath.record, [element, ...recordAndPath.parentElements])
  },
}
