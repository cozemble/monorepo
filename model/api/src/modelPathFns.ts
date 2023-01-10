import {
  DataRecord,
  DataRecordPath,
  Model,
  ModelPath,
  ModelPathElement,
  Property,
  propertyDescriptors,
} from '@cozemble/model-core'
import { dataRecordPathFns } from './dataRecordPathFns'
import { DataRecordPathElement } from '@cozemble/model-core'

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
  prefix<E extends ModelPathElement>(element: E, p: ModelPath<E>): ModelPath<E> {
    return { ...p, parentElements: [element, ...p.parentElements] }
  },
  getValues(
    models: Model[],
    path: ModelPath<Property>,
    record: DataRecord,
  ): DataRecordPathAndValue {
    let parentElements: DataRecordPathElement[] = []
    record = path.parentElements.reduce((record, element) => {
      if (element._type === 'relationship' && element.subType === 'has.one.relationship') {
        parentElements = [...parentElements, element]
        return record.values[element.id.value]
      }
      return null
    }, record)
    const value = record
      ? propertyDescriptors.mandatory(path.lastElement).getValue(path.lastElement, record)
      : null
    return dataRecordRecordPathAndValue(
      dataRecordPathFns.newInstance(path.lastElement, ...parentElements),
      value,
    )
  },
  isPathToProperty<E extends ModelPathElement>(path: ModelPath<E>): boolean {
    return path.lastElement._type === 'property'
  },
}
