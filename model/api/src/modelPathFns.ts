import { arrays } from '@cozemble/lang-util'
import type {
  Cardinality,
  DataRecord,
  DataRecordValuePath,
  DottedPath,
  Model,
  ModelPath,
  ModelPathElement,
} from '@cozemble/model-core'
import { dottedPathFns, LeafModelSlot } from '@cozemble/model-core'
import { modelFns } from './modelsFns'
import { valuesForModelPath, ValuesForModelPath } from './valuesForModelPath'

export interface DataRecordPathAndValue<T = any> {
  _type: 'data.record.path.and.value'
  path: DataRecordValuePath
  value: T | null
}

export function dataRecordRecordPathAndValue<T>(
  path: DataRecordValuePath,
  value: T | null,
): DataRecordPathAndValue<T> {
  return {
    _type: 'data.record.path.and.value',
    path,
    value,
  }
}

export const modelPathFns = {
  newInstance<E extends ModelPathElement>(
    lastElement: E,
    ...parentElements: ModelPathElement[]
  ): ModelPath<E> {
    return {
      _type: 'model.path',
      lastElement,
      parentElements,
    }
  },
  cardinality<E extends ModelPathElement>(path: ModelPath<E>): Cardinality {
    const hasAtLeastOneMany = path.parentElements.some(
      (element) => element._type === 'nested.model' && element.cardinality === 'many',
    )
    return hasAtLeastOneMany ? 'many' : 'one'
  },
  prefix<E extends ModelPathElement>(element: E, p: ModelPath<E>): ModelPath<E> {
    return { ...p, parentElements: [element, ...p.parentElements] }
  },
  getValues(
    models: Model[],
    path: ModelPath<LeafModelSlot>,
    record: DataRecord,
  ): ValuesForModelPath {
    return valuesForModelPath(models, path, record)
  },
  isPathToProperty<E extends ModelPathElement>(path: ModelPath<E>): boolean {
    return path.lastElement._type === 'property'
  },
  fromNames<E extends ModelPathElement>(
    models: Model[],
    model: Model,
    ...names: string[]
  ): ModelPath<E> {
    const elements = names.map((name) => {
      const element = modelFns.elementByName(model, name)
      if (element._type === 'nested.model') {
        model = modelFns.findById(models, element.modelId)
      }
      return element
    })
    const [parentElements, lastElement] = arrays.splitLast(elements)
    return {
      _type: 'model.path',
      lastElement: lastElement as E,
      parentElements,
    }
  },
  toDottedNamePath<E extends ModelPathElement>(path: ModelPath<E>): DottedPath {
    const namePath = [
      ...path.parentElements.map((element) => element.name.value),
      path.lastElement.name.value,
    ].join('.')
    return dottedPathFns.dottedNamePath(namePath)
  },
  toDottedIdPath<E extends ModelPathElement>(path: ModelPath<E>): DottedPath {
    const namePath = [
      ...path.parentElements.map((element) => element.id.value),
      path.lastElement.id.value,
    ].join('.')
    return dottedPathFns.dottedIdPath(namePath)
  },
}
