import type {
  DataRecord,
  DataRecordPathParentElement,
  Model,
  ModelPath,
  ModelPathElement,
  Property,
} from '@cozemble/model-core'
import { propertyDescriptors } from '@cozemble/model-core'
import { dataRecordValuePathFns } from './dataRecordValuePathFns'
import { DataRecordPathAndValue, dataRecordRecordPathAndValue, modelPathFns } from './modelPathFns'
import { modelFns } from './modelsFns'
import { nestedModelFns } from './nestedModelFns'

type PathRecordProperty = {
  parentElements: DataRecordPathParentElement[]
  record: DataRecord
  property: Property | null
  terminal: boolean
}

function getValuesRecursive(
  models: Model[],
  property: Property,
  parentElements: ModelPathElement[],
  acc: PathRecordProperty[],
): PathRecordProperty[] {
  if (parentElements.length === 0) {
    return acc.map((prp) => {
      return { ...prp, property, terminal: true }
    })
  }
  const [parentElement, ...rest] = parentElements
  if (parentElement._type === 'property') {
    throw new Error('Invalid element in path (property)')
  }
  if (
    parentElement._type === 'model.reference' ||
    parentElement._type === 'inlined.model.reference'
  ) {
    throw new Error(`to do ${parentElement._type}`)
  }
  if (parentElement.cardinality === 'one') {
    return acc.flatMap((prp) => {
      const childRecord = nestedModelFns.getOneValue(prp.record, parentElement)
      if (childRecord === null) {
        return [{ ...prp, property: null, terminal: true }]
      }
      return getValuesRecursive(models, property, rest, [
        { ...prp, record: childRecord, parentElements: [...prp.parentElements, parentElement] },
      ])
    })
  } else {
    return acc.flatMap((prp) => {
      const childRecords = nestedModelFns.getManyValues(prp.record, parentElement)
      if (childRecords === null || childRecords.length === 0) {
        return [{ ...prp, property: null, terminal: true }]
      }
      return childRecords.flatMap((childRecord, index) => {
        return getValuesRecursive(models, property, rest, [
          {
            ...prp,
            record: childRecord,
            parentElements: [
              ...prp.parentElements,
              dataRecordValuePathFns.newNestedRecordArrayPathElement(parentElement, index),
            ],
          },
        ])
      })
    })
  }
}

export interface SingleCardinalityValuesForModelPath {
  _type: 'single.cardinality.values.for.model.path.response'
  value: DataRecordPathAndValue
}

export function singleCardinalityValuesForModelPathResponse(
  value: DataRecordPathAndValue,
): SingleCardinalityValuesForModelPath {
  return {
    _type: 'single.cardinality.values.for.model.path.response',
    value,
  }
}

export interface ManyCardinalityValuesForModelPath {
  _type: 'many.cardinality.values.for.model.path.response'
  value: DataRecordPathAndValue[]
}

export function manyCardinalityValuesForModelPathResponse(
  value: DataRecordPathAndValue[],
): ManyCardinalityValuesForModelPath {
  return {
    _type: 'many.cardinality.values.for.model.path.response',
    value,
  }
}

export type ValuesForModelPath =
  | SingleCardinalityValuesForModelPath
  | ManyCardinalityValuesForModelPath

export const valuesForModelPathFns = {
  flatten: (values: ValuesForModelPath): DataRecordPathAndValue[] => {
    if (values._type === 'single.cardinality.values.for.model.path.response') {
      return [values.value]
    } else {
      return values.value
    }
  },
}

export function valuesForModelPath(
  models: Model[],
  path: ModelPath<Property>,
  record: DataRecord,
): ValuesForModelPath {
  const values = getValuesRecursive(models, path.lastElement, path.parentElements, [
    {
      parentElements: [],
      record,
      property: null,
      terminal: false,
    },
  ]).flatMap((prp) => {
    if (prp.property === null) {
      return []
    }
    const value = propertyDescriptors
      .mandatory(prp.property.propertyType)
      .getValue(prp.property, prp.record)
    return [
      dataRecordRecordPathAndValue(
        dataRecordValuePathFns.newInstance(prp.property, ...prp.parentElements),
        value,
      ),
    ]
  })
  const cardinality = modelPathFns.cardinality(path)
  if (cardinality === 'one') {
    if (values.length > 1) {
      throw new Error(`Got ${values.length} values for single cardinality path`)
    }
    if (values.length === 0) {
      const model = modelFns.findById(models, record.modelId)
      const dataRecordPath = dataRecordValuePathFns.fromDottedPath(
        models,
        model,
        modelPathFns.toDottedNamePath(path),
      )
      return singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(dataRecordPath, null),
      )
    }
    return singleCardinalityValuesForModelPathResponse(values[0])
  }
  return manyCardinalityValuesForModelPathResponse(values)
}
