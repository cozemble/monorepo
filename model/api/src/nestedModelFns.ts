import type { Cardinality, Model, ModelId } from '@cozemble/model-core'
import {
  type DataRecord,
  NestedModel,
  NestedModelId,
  nestedModelIdFns,
  NestedModelName,
} from '@cozemble/model-core'
import { modelFns } from './modelsFns.js'

export const nestedModelFns = {
  newInstance: (
    name: string | NestedModelName,
    relatedModelId: ModelId,
    cardinality: Cardinality,
    id: NestedModelId = nestedModelIdFns.newInstance(),
  ): NestedModel => {
    return {
      _type: 'nested.model',
      cardinality,
      modelId: relatedModelId,
      id,
      name: typeof name === 'string' ? { _type: 'nested.model.name', value: name } : name,
    }
  },
  setValue(
    models: Model[],
    record: DataRecord,
    nestedModel: NestedModel,
    value: DataRecord | DataRecord[] | null,
  ): DataRecord {
    const model = modelFns.findById(models, record.modelId)
    const element = modelFns.maybeElementById(model, nestedModel.id.value)
    if (!element) {
      throw new Error(`Could not find element with id ${nestedModel.id.value}`)
    }
    if (element._type !== 'nested.model') {
      throw new Error(`Element with id ${nestedModel.id.value} is not a nested model`)
    }
    if (nestedModel.cardinality === 'one') {
      if (Array.isArray(value)) {
        throw new Error('Cannot set a single cardinality nested model to an array of values')
      }
    } else {
      if (!Array.isArray(value)) {
        throw new Error('Cannot set a has.many.relationship to a non-array value')
      }
    }
    return { ...record, values: { ...record.values, [nestedModel.id.value]: value } }
  },
  getValue(record: DataRecord, nestedModel: NestedModel): DataRecord | DataRecord[] | null {
    if (record === null || record === undefined) {
      return null
    }
    if (nestedModel.cardinality === 'one') {
      return record.values[nestedModel.id.value]
    }
    return record.values[nestedModel.id.value] ?? []
  },
  getOneValue(record: DataRecord, nestedModel: NestedModel): DataRecord | null {
    if (nestedModel.cardinality === 'many') {
      throw new Error('Cannot get a single value from a high cardinality nested model')
    }
    if (record === null || record === undefined) {
      return null
    }
    return record.values[nestedModel.id.value] ?? null
  },
  getManyValues(record: DataRecord, nestedModel: NestedModel): DataRecord[] | null {
    if (nestedModel.cardinality === 'one') {
      throw new Error('Cannot get a many values from a low cardinality nested model')
    }
    if (record === null || record === undefined) {
      return null
    }
    return record.values[nestedModel.id.value] ?? null
  },
}
