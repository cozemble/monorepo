import {
  DataRecord,
  type DataRecordPath,
  type DataRecordPathElement,
  type DottedPath,
  dottedPathFns,
  Property,
  propertyDescriptors,
} from '@cozemble/model-core'

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
      if (parentElement._type === 'has.one.relationship') {
        return acc.values[parentElement.id.value]
      }
      return acc.values[parentElement.relationship.id.value].find(
        (r: DataRecord) => r.id.value === parentElement.recordId.value,
      )
    }, record)
    const reducedPath = dataRecordPathFns.newInstance(path.lastElement)
    return dataRecordPathFns.getValue(reducedPath, deref)
  },
  setValue<T>(path: DataRecordPath, record: DataRecord, t: T | null): DataRecord {
    if (path.parentElements.length > 0) {
      throw new Error('Not implemented: dataRecordPaths with parent elements')
    }
    return propertyDescriptors.mandatory(path.lastElement).setValue(path.lastElement, record, t)
  },
  toDottedPath(path: DataRecordPath): DottedPath {
    const parentIds = path.parentElements.map((e) => {
      if (e._type === 'has.one.relationship') {
        return e.id.value
      } else {
        return e.relationship.id.value
      }
    })
    const parts = [...parentIds, path.lastElement.id.value]
    return dottedPathFns.newInstance(parts.join('.'))
  },
  sameDottedPaths(path1: DataRecordPath, path2: DataRecordPath): boolean {
    return (
      dataRecordPathFns.toDottedPath(path1).value === dataRecordPathFns.toDottedPath(path2).value
    )
  },
}
