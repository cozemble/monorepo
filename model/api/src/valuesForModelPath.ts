import type {
  DataRecord,
  DataRecordPathParentElement,
  Model,
  ModelPath,
  ModelPathElement,
} from '@cozemble/model-core'
import { LeafModelSlot, modelSlotFns, SystemConfiguration } from '@cozemble/model-core'
import { dataRecordValuePathFns } from './dataRecordValuePathFns'
import { DataRecordPathAndValue, dataRecordRecordPathAndValue, modelPathFns } from './modelPathFns'
import { modelFns } from './modelsFns'
import { nestedModelFns } from './nestedModelFns'

type PathRecordLeafSlot = {
  parentElements: DataRecordPathParentElement[]
  record: DataRecord
  leafSlot: LeafModelSlot | null
  terminal: boolean
}

function getValuesRecursive(
  models: Model[],
  leafSlot: LeafModelSlot,
  parentElements: ModelPathElement[],
  acc: PathRecordLeafSlot[],
): PathRecordLeafSlot[] {
  if (parentElements.length === 0) {
    return acc.map((prp) => {
      return { ...prp, leafSlot, terminal: true }
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
      return getValuesRecursive(models, leafSlot, rest, [
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
        return getValuesRecursive(models, leafSlot, rest, [
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
  systemConfiguration: SystemConfiguration,
  models: Model[],
  path: ModelPath<LeafModelSlot>,
  record: DataRecord,
): ValuesForModelPath {
  const values = getValuesRecursive(models, path.lastElement, path.parentElements, [
    {
      parentElements: [],
      record,
      leafSlot: null,
      terminal: false,
    },
  ]).flatMap((prp) => {
    if (prp.leafSlot === null) {
      return []
    }
    const value = modelSlotFns.getValue(systemConfiguration, prp.leafSlot, prp.record)
    return [
      dataRecordRecordPathAndValue(
        dataRecordValuePathFns.newInstance(prp.leafSlot, ...prp.parentElements),
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
        modelPathFns.toDottedIdPath(path),
      )
      return singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(dataRecordPath, null),
      )
    }
    return singleCardinalityValuesForModelPathResponse(values[0])
  }
  return manyCardinalityValuesForModelPathResponse(values)
}
