import { arrays, errors, strings } from '@cozemble/lang-util'
import type {
  DataRecord,
  DataRecordPathParentElement,
  DataRecordValuePath,
  DottedPath,
  Model,
  ModelPathElement,
} from '@cozemble/model-core'
import {
  dottedPathFns,
  LeafModelSlot,
  ModelPath,
  modelPathElementFns,
  modelReferenceValuePlaceholder,
  NestedModel,
  NestedRecordArrayPathElement,
  propertyDescriptors,
  SystemConfiguration,
} from '@cozemble/model-core'
import { dataRecordFns } from './dataRecordFns.js'
import { modelFns } from './modelsFns.js'
import { nestedModelFns } from './nestedModelFns.js'

function modelElementsToDataRecordPath(
  lastElement: LeafModelSlot,
  parentElements: ModelPathElement[],
) {
  const parentRecordPathElements: DataRecordPathParentElement[] = parentElements.map((element) => {
    if (element._type === 'nested.model') {
      if (element.cardinality === 'one') {
        return element
      }
      throw new Error(
        `Invalid element in path: nested model with cardinality many: ${element._type}`,
      )
    }
    throw new Error(`Invalid element in path: ${element._type}`)
  })
  return dataRecordValuePathFns.newInstance(lastElement, ...parentRecordPathElements)
}

function fromDottedIdPath(
  models: Model[],
  model: Model,
  dottedPath: DottedPath,
): DataRecordValuePath {
  const elements = modelFns.elementsById(models, model, dottedPathFns.split(dottedPath))
  const [parentElements, lastElement] = arrays.splitLast(elements)
  if (lastElement._type !== 'property') {
    throw new Error(`Last element of path must be a property: ${dottedPath.value}`)
  }
  return modelElementsToDataRecordPath(lastElement, parentElements)
}

function fromDottedNamePath(
  models: Model[],
  model: Model,
  dottedPath: DottedPath,
): DataRecordValuePath {
  const elements = modelFns.elementsByName(models, model, dottedPathFns.split(dottedPath))
  const [parentElements, lastElement] = arrays.splitLast(elements)
  if (lastElement._type === 'property' || lastElement._type === 'model.reference') {
    return modelElementsToDataRecordPath(lastElement, parentElements)
  }
  throw new Error(`Illegal last element of path: ${dottedPath.value}`)
}

function setLeafSlotValue<T>(
  systemConfiguration: SystemConfiguration,
  path: DataRecordValuePath,
  record: DataRecord,
  t: T | null,
) {
  if (path.lastElement._type === 'property') {
    return propertyDescriptors
      .mandatory(path.lastElement)
      .setValue(systemConfiguration, path.lastElement, record, t)
  }
  throw new Error("Can't set value on a model reference, update the edge instead")
}

export const dataRecordValuePathFns = {
  newInstance: (
    lastElement: LeafModelSlot,
    ...parentElements: DataRecordPathParentElement[]
  ): DataRecordValuePath => {
    return {
      _type: 'data.record.value.path',
      parentElements,
      lastElement,
    }
  },
  getValue<T>(
    systemConfiguration: SystemConfiguration,
    path: DataRecordValuePath,
    record: DataRecord,
  ): T | null {
    if (record === null || record === undefined) {
      return null
    }
    if (path.parentElements.length === 0) {
      if (path.lastElement._type === 'property') {
        return propertyDescriptors
          .mandatory(path.lastElement)
          .getValue(systemConfiguration, path.lastElement, record)
      }
      return modelReferenceValuePlaceholder as T
    }
    const deref = path.parentElements.reduce((acc, parentElement) => {
      if (acc === undefined) {
        return undefined
      }
      if (parentElement._type === 'nested.model') {
        return acc.values[parentElement.id.value]
      } else if (parentElement._type === 'nested.record.array.path.element') {
        const relationshipRecords = acc.values[parentElement.nestedModel.id.value] ?? []
        return relationshipRecords[parentElement.recordReference.index]
      }
    }, record)
    const reducedPath = dataRecordValuePathFns.newInstance(path.lastElement)
    return dataRecordValuePathFns.getValue(systemConfiguration, reducedPath, deref)
  },
  setValue<T>(
    systemConfiguration: SystemConfiguration,
    models: Model[],
    path: DataRecordValuePath,
    initialRecord: DataRecord,
    t: T | null,
  ): DataRecord {
    if (path.parentElements.length === 0) {
      return setLeafSlotValue(systemConfiguration, path, initialRecord, t)
    }
    path.parentElements.reduce((record, parentElement, index) => {
      if (parentElement._type === 'nested.model') {
        if (parentElement.cardinality === 'one') {
          let nestedRecord = record.values[parentElement.id.value]
          if (nestedRecord === undefined) {
            const nestedModel = modelFns.findById(models, parentElement.modelId)
            nestedRecord = dataRecordFns.newInstance(nestedModel, record.createdBy.value)
          }
          if (index === path.parentElements.length - 1) {
            nestedRecord = setLeafSlotValue(systemConfiguration, path, nestedRecord, t)
          }
          record.values[parentElement.id.value] = nestedRecord
          return nestedRecord
        } else {
          throw new Error(
            `Not implemented: nested model with cardinality ${parentElement.cardinality}`,
          )
        }
      }
    }, initialRecord)
    return initialRecord
  },
  toDottedPath(path: DataRecordValuePath, pathType: 'id' | 'name' = 'id'): DottedPath {
    try {
      if (pathType === 'name') {
        const dotted = [
          ...path.parentElements.map((element) => {
            if (element._type === 'nested.model') {
              return element.name.value
            }
            throw new Error(`Invalid element in path: ${element._type}`)
          }),
          path.lastElement.name.value,
        ]
          .map((s) => strings.camelize(s))
          .join('.')
        return dottedPathFns.newInstance(dotted, 'name')
      }
      const parentIds = path.parentElements.map((e) => {
        if (e._type === 'nested.model') {
          return e.id.value
        }
        if (e._type === 'nested.record.array.path.element') {
          return `${e.nestedModel.id.value}.${e.recordReference.index}`
        }
        throw new Error(`Invalid element in path: ${e._type}`)
      })
      const parts = [...parentIds, path.lastElement.id.value]
      return dottedPathFns.newInstance(parts.join('.'))
    } catch (e) {
      throw errors.prependToMessage(
        e,
        `Error converting path to dotted path: ${JSON.stringify(path)}`,
      )
    }
  },
  fromDottedPath(models: Model[], model: Model, dottedPath: DottedPath): DataRecordValuePath {
    try {
      return dottedPath.partType === 'name'
        ? fromDottedNamePath(models, model, dottedPath)
        : fromDottedIdPath(models, model, dottedPath)
    } catch (e) {
      throw errors.prependToMessage(
        e,
        `While hydrating path: ${dottedPath.value} in model: ${model.name.value}`,
      )
    }
  },
  sameDottedPaths(path1: DataRecordValuePath, path2: DataRecordValuePath): boolean {
    return dottedPathFns.equals(
      dataRecordValuePathFns.toDottedPath(path1),
      dataRecordValuePathFns.toDottedPath(path2),
    )
  },
  addHasManyItem(
    _models: Model[],
    parentPath: DataRecordPathParentElement[],
    nestedModel: NestedModel,
    initialRecord: DataRecord,
    item: DataRecord,
  ): DataRecord {
    if (parentPath.length === 0) {
      let items: DataRecord[] = (nestedModelFns.getValue(initialRecord, nestedModel) ??
        []) as DataRecord[]
      items = [...items, item]
      return {
        ...initialRecord,
        values: { ...initialRecord.values, [nestedModel.id.value]: items },
      }
    }
    throw new Error('Not implemented: addHasManyItem with parent paths')
  },
  newNestedRecordArrayPathElement(
    nestedModel: NestedModel,
    index: number,
  ): NestedRecordArrayPathElement {
    return {
      _type: 'nested.record.array.path.element',
      nestedModel,
      recordReference: { _type: 'by.index.record.reference', index },
    }
  },
  fromNames(models: Model[], model: Model, ...names: string[]) {
    const [parentNames, leafSlotName] = arrays.splitLast(names)
    const elements: DataRecordPathParentElement[] = parentNames.map((name: any) => {
      if (name.indexOf('.') !== -1) {
        const parts = name.split('.')
        if (parts.length !== 2) {
          throw new Error(`Invalid path: ${name}`)
        }
        const [nestedModelName, index] = parts
        const nestedModelElement = modelFns.elementByName(model, nestedModelName)
        if (nestedModelElement._type !== 'nested.model') {
          throw new Error(`Invalid path: ${name}`)
        }
        model = modelFns.findById(models, nestedModelElement.modelId)
        return dataRecordValuePathFns.newNestedRecordArrayPathElement(
          nestedModelElement,
          parseInt(index),
        )
      }
      const element = modelFns.elementByName(model, name)
      if (element._type === 'property' || element._type === 'model.reference') {
        throw new Error(`Invalid path: ${name} - found a ${element._type} in the parent path`)
      }
      if (element._type === 'inlined.model.reference') {
        throw new Error(`Invalid path: ${name} - found an unknown element type: ${element._type}`)
      }
      if (element.cardinality === 'many') {
        throw new Error(`Invalid path: ${name} - found a has many relationship in the parent path`)
      }
      model = modelFns.findById(models, element.modelId)
      return element
    })
    const lastElement = modelFns.elementByName(model, leafSlotName)
    if (!modelPathElementFns.isLeafSlot(lastElement)) {
      throw new Error(`Invalid path: ${names.join('.')} - last element is not a leaf model slot`)
    }
    return dataRecordValuePathFns.newInstance(lastElement as LeafModelSlot, ...elements)
  },
  fromIds(models: Model[], model: Model, ...ids: string[]) {
    const [parentIds, leafSlotId] = arrays.splitLast(ids)
    const elements: DataRecordPathParentElement[] = parentIds.map((id: string) => {
      const element = modelFns.elementById(model, id)
      if (element._type === 'property' || element._type === 'model.reference') {
        throw new Error(`Invalid path: found a ${element._type} in the parent path`)
      }
      if (element._type === 'inlined.model.reference') {
        throw new Error(`Invalid path: found an unknown element type: ${element._type}`)
      }
      if (element.cardinality === 'many') {
        throw new Error(`Invalid path: found a has many relationship in the parent path`)
      }
      model = modelFns.findById(models, element.modelId)
      return element
    })
    const lastElement = modelFns.elementById(model, leafSlotId)
    if (!modelPathElementFns.isLeafSlot(lastElement)) {
      throw new Error(`Invalid path: last element is not a leaf model slot`)
    }
    return dataRecordValuePathFns.newInstance(lastElement as LeafModelSlot, ...elements)
  },
  fromModelPath(modelPath: ModelPath<ModelPathElement>): DataRecordValuePath {
    if (
      modelPath.lastElement._type === 'model.reference' ||
      modelPath.lastElement._type === 'property'
    ) {
      return modelPath.parentElements.reduce((acc, element) => {
        if (element._type === 'nested.model' || element._type === 'inlined.model.reference') {
          return { ...acc, parentElements: [...acc.parentElements, element] }
        }
        throw new Error(`Cannot convert model path to data record value path: ${element._type}`)
      }, dataRecordValuePathFns.newInstance(modelPath.lastElement))
    } else {
      throw new Error(`Invalid model path: ${JSON.stringify(modelPath)}`)
    }
  },
}
