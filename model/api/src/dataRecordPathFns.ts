import { arrays, errors, strings } from '@cozemble/lang-util'
import type {
  DataRecord,
  DataRecordPath,
  DataRecordPathElement,
  DottedPath,
  Model,
  ModelPathElement,
  Property,
} from '@cozemble/model-core'
import {
  dottedPathFns,
  NestedModel,
  NestedRecordArrayPathElement,
  propertyDescriptors,
} from '@cozemble/model-core'
import { dataRecordFns } from './dataRecordFns'
import { modelFns } from './modelsFns'
import { nestedModelFns } from './nestedModelFns'

function modelElementsToDataRecordPath(lastElement: Property, parentElements: ModelPathElement[]) {
  const parentRecordPathElements: DataRecordPathElement[] = parentElements.map((element) => {
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
  return dataRecordPathFns.newInstance(lastElement, ...parentRecordPathElements)
}

function fromDottedIdPath(models: Model[], model: Model, dottedPath: DottedPath): DataRecordPath {
  const elements = modelFns.elementsById(models, model, dottedPathFns.split(dottedPath))
  const [parentElements, lastElement] = arrays.splitLast(elements)
  if (lastElement._type !== 'property') {
    throw new Error(`Last element of path must be a property: ${dottedPath.value}`)
  }
  return modelElementsToDataRecordPath(lastElement, parentElements)
}

function fromDottedNamePath(models: Model[], model: Model, dottedPath: DottedPath): DataRecordPath {
  const elements = modelFns.elementsByName(models, model, dottedPathFns.split(dottedPath))
  const [parentElements, lastElement] = arrays.splitLast(elements)
  if (lastElement._type !== 'property') {
    throw new Error(`Last element of path must be a property: ${dottedPath.value}`)
  }
  return modelElementsToDataRecordPath(lastElement, parentElements)
}

export const dataRecordPathFns = {
  newInstance: (
    lastElement: Property,
    ...parentElements: DataRecordPathElement[]
  ): DataRecordPath => {
    return {
      _type: 'data.record.path',
      parentElements,
      lastElement,
    }
  },
  getValue<T>(path: DataRecordPath, record: DataRecord): T | null {
    if (record === null || record === undefined) {
      return null
    }
    if (path.parentElements.length === 0) {
      return propertyDescriptors.mandatory(path.lastElement).getValue(path.lastElement, record)
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
    const reducedPath = dataRecordPathFns.newInstance(path.lastElement)
    return dataRecordPathFns.getValue(reducedPath, deref)
  },
  setValue<T>(
    models: Model[],
    path: DataRecordPath,
    initialRecord: DataRecord,
    t: T | null,
  ): DataRecord {
    if (path.parentElements.length === 0) {
      return propertyDescriptors
        .mandatory(path.lastElement)
        .setValue(path.lastElement, initialRecord, t)
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
            nestedRecord = propertyDescriptors
              .mandatory(path.lastElement)
              .setValue(path.lastElement, nestedRecord, t)
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
  toDottedPath(path: DataRecordPath, pathType: 'id' | 'name' = 'id'): DottedPath {
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
  fromDottedPath(models: Model[], model: Model, dottedPath: DottedPath): DataRecordPath {
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
  sameDottedPaths(path1: DataRecordPath, path2: DataRecordPath): boolean {
    return dottedPathFns.equals(
      dataRecordPathFns.toDottedPath(path1),
      dataRecordPathFns.toDottedPath(path2),
    )
  },
  addHasManyItem(
    models: Model[],
    parentPath: DataRecordPathElement[],
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
    const [parentNames, propertyName] = arrays.splitLast(names)
    const elements: DataRecordPathElement[] = parentNames.map((name) => {
      if (name.indexOf('.') !== -1) {
        const parts = name.split('.')
        if (parts.length !== 2) {
          throw new Error(`Invalid path: ${name}`)
        }
        const [nestedModelName, index] = parts
        const nestedModelElement = modelFns.elementByName(model, nestedModelName)
        if (
          nestedModelElement._type !== 'nested.model' ||
          nestedModelElement.cardinality !== 'many'
        ) {
          throw new Error(`Invalid path: ${name}`)
        }
        model = modelFns.findById(models, nestedModelElement.modelId)
        return dataRecordPathFns.newNestedRecordArrayPathElement(
          nestedModelElement,
          parseInt(index),
        )
      }
      const element = modelFns.elementByName(model, name)
      if (element._type === 'property') {
        throw new Error(`Invalid path: ${name} - found a property in the parent path`)
      }
      if (element._type === 'model.reference') {
        if (element.referencedModels.length > 1) {
          throw new Error(`to do : ${name} - model references with more than one referenced model`)
        }
        model = modelFns.findById(models, element.referencedModels[0])
        return element
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
    const lastElement = modelFns.elementByName(model, propertyName)
    if (lastElement._type !== 'property') {
      throw new Error(`Invalid path: ${names.join('.')} - last element is not a property`)
    }
    return dataRecordPathFns.newInstance(lastElement, ...elements)
  },
}
