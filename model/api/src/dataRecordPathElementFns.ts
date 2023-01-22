import type { DataRecord, DataRecordPathElement, DottedPath, Model } from '@cozemble/model-core'
import {
  dottedPathFns,
  type HasManyRelationshipPathElement,
  hasManyRelationshipPathElement,
  type HasOneRelationship,
} from '@cozemble/model-core'
import { modelFns } from './modelsFns'

export const dataRecordPathElementFns = {
  hasManyRelationshipPathElement,
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
  fromDottedNamePath(
    models: Model[],
    model: Model,
    dottedNamePath: DottedPath,
  ): DataRecordPathElement[] {
    const names = dottedPathFns.split(dottedNamePath)
    return names.map((name) => {
      if (name.indexOf('.') !== -1) {
        const parts = name.split('.')
        if (parts.length !== 2) {
          throw new Error(`Invalid name: ${name}`)
        }
        const [relationshipName, recordIndex] = parts
        const relationship = model.relationships.find(
          (relationship) => relationship.name.value === relationshipName,
        )
        if (!relationship) {
          throw new Error(`Relationship not found: ${relationshipName}`)
        }
        if (relationship.subType !== 'has.many.relationship') {
          throw new Error(`Expected has many relationship: ${relationshipName}`)
        }
        const result: HasManyRelationshipPathElement = {
          _type: 'has.many.relationship.path.element',
          relationship,
          recordReference: { _type: 'by.index.record.reference', index: parseInt(recordIndex) },
        }
        return result
      } else {
        return modelFns.elementByName(model, name) as HasOneRelationship
      }
    })
  },
  same(a: DataRecordPathElement[], b: DataRecordPathElement[]): boolean {
    return this.toDottedNamePath(a).value === this.toDottedNamePath(b).value
  },
}
