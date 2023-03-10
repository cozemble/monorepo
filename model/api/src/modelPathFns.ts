import { arrays } from '@cozemble/lang-util'
import type {
  DataRecord,
  DataRecordPath,
  Model,
  ModelPath,
  ModelPathElement,
  Property,
  Cardinality,
  DottedPath,
} from '@cozemble/model-core'
import { dottedPathFns } from '@cozemble/model-core'
import { modelFns } from './modelsFns'
import { valuesForModelPath, ValuesForModelPath } from './valuesForModelPath'

export interface DataRecordPathAndValue<T = any> {
  _type: 'data.record.path.and.value'
  path: DataRecordPath
  value: T | null
}

export function dataRecordRecordPathAndValue<T>(
  path: DataRecordPath,
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
      (element) => element._type === 'relationship' && element.subType === 'has.many.relationship',
    )
    return hasAtLeastOneMany ? 'many' : 'one'
  },
  prefix<E extends ModelPathElement>(element: E, p: ModelPath<E>): ModelPath<E> {
    return { ...p, parentElements: [element, ...p.parentElements] }
  },
  getValues(models: Model[], path: ModelPath<Property>, record: DataRecord): ValuesForModelPath {
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
      if (element._type === 'relationship') {
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
}
