import { arrays, errors, strings } from '@cozemble/lang-util'
import {
  DataRecord,
  type DataRecordPath,
  type DataRecordPathElement,
  type DottedPath,
  dottedPathFns,
  Model,
  ModelPathElement,
  Property,
  propertyDescriptors,
} from '@cozemble/model-core'
import { dataRecordFns } from './dataRecordFns'
import { modelFns } from './modelsFns'

function modelElementsToDataRecordPath(lastElement: Property, parentElements: ModelPathElement[]) {
  const parentRecordPathElements: DataRecordPathElement[] = parentElements.map((element) => {
    if (element._type === 'relationship') {
      if (element.subType === 'has.one.relationship') {
        return element
      }
      throw new Error(`Invalid element in path: ${element.subType}`)
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
      if (parentElement._type === 'relationship') {
        if (parentElement.subType === 'has.one.relationship') {
          return acc.values[parentElement.id.value]
        }
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
      if (parentElement._type === 'relationship') {
        if (parentElement.subType === 'has.one.relationship') {
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
          throw new Error(`Not implemented: ${parentElement.subType}`)
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
            if (element._type === 'relationship') {
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
        if (e._type === 'relationship') {
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
}
