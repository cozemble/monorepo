import type { DataRecord, DataRecordPathElement, DottedPath, Model } from '@cozemble/model-core'

export const dataRecordPathElementFns = {
  toDottedNamePath(elements: DataRecordPathElement[]): DottedPath {
    return {
      _type: 'dotted.path',
      partType: 'name',
      value: elements
        .map((element) => {
          if (element._type === 'has.many.relationship.path.element') {
            return element.relationship.name.value
          }
          return element.name.value
        })
        .join('.'),
    }
  },
  getChildRecord(
    models: Model[],
    record: DataRecord,
    elements: DataRecordPathElement[],
  ): DataRecord | null {
    let currentRecord = record
    for (const element of elements) {
      if (currentRecord === null) {
        return null
      }
      if (element._type === 'has.many.relationship.path.element') {
        const relationship = element.relationship
        const relationshipArray = record.values[relationship.id.value]
        if (!relationshipArray) {
          return null
        }
        if (!Array.isArray(relationshipArray)) {
          throw new Error(`Expected relationship array: ${relationship.name.value}`)
        }
        currentRecord = relationshipArray[element.recordReference.index] ?? null
      } else {
        currentRecord = currentRecord.values[element.id.value] ?? null
      }
    }
    return currentRecord
  },
}
