import type {
  DataRecord,
  DataRecordPathParentElement,
  DottedPath,
  Model,
} from '@cozemble/model-core'
import { dottedPathFns } from '@cozemble/model-core'
import { modelFns } from './modelsFns'
import { NestedModel, NestedRecordArrayPathElement } from '@cozemble/model-core'

export const dataRecordPathElementFns = {
  toDottedNamePath(elements: DataRecordPathParentElement[]): DottedPath {
    return {
      _type: 'dotted.path',
      partType: 'name',
      value: elements
        .map((element) => {
          if (element._type === 'nested.record.array.path.element') {
            return element.nestedModel.name.value
          }
          return element.name.value
        })
        .join('.'),
    }
  },
  getNestedRecord(
    models: Model[],
    record: DataRecord,
    elements: DataRecordPathParentElement[],
  ): DataRecord | null {
    let currentRecord = record
    for (const element of elements) {
      if (currentRecord === null) {
        return null
      }
      if (element._type === 'inlined.model.reference' || element._type === 'model.reference') {
        throw new Error(`Invalid element in path: ${element._type}`)
      }
      if (element._type === 'nested.record.array.path.element') {
        const nestedModel = element.nestedModel
        const relationshipArray = record.values[nestedModel.id.value]
        if (!relationshipArray) {
          return null
        }
        if (!Array.isArray(relationshipArray)) {
          throw new Error(`Expected relationship array: ${nestedModel.name.value}`)
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
  ): DataRecordPathParentElement[] {
    const names = dottedPathFns.split(dottedNamePath)
    return names.map((name) => {
      if (name.indexOf('.') !== -1) {
        const parts = name.split('.')
        if (parts.length !== 2) {
          throw new Error(`Invalid name: ${name}`)
        }
        const [nestedModelName, recordIndex] = parts
        const nestedModel = model.nestedModels.find(
          (relationship) => relationship.name.value === nestedModelName,
        )
        if (!nestedModel) {
          throw new Error(`Nested model not found: ${nestedModelName}`)
        }
        if (nestedModel.cardinality !== 'many') {
          throw new Error(`Expected has many nested model: ${nestedModelName}`)
        }
        const result: NestedRecordArrayPathElement = {
          _type: 'nested.record.array.path.element',
          nestedModel,
          recordReference: { _type: 'by.index.record.reference', index: parseInt(recordIndex) },
        }
        return result
      } else {
        return modelFns.elementByName(model, name) as NestedModel
      }
    })
  },
  same(a: DataRecordPathParentElement[], b: DataRecordPathParentElement[]): boolean {
    return this.toDottedNamePath(a).value === this.toDottedNamePath(b).value
  },
}
