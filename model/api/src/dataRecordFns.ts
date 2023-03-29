import { clock, mandatory, uuids } from '@cozemble/lang-util'
import type { DataRecordPathElement } from '@cozemble/model-core'
import {
  type DataRecord,
  type DataRecordAndPath,
  dataRecordAndPathFns,
  dottedPathFns,
  type Model,
  propertyDescriptors,
} from '@cozemble/model-core'
import { modelFns } from './modelsFns'
import { dataRecordPathElementFns } from './dataRecordPathElementFns'
import { nestedRecordArrayPathElement } from '@cozemble/model-core'

function getChildRecord(
  models: Model[],
  childRecord: DataRecord | null,
  acc: DataRecordAndPath[],
  rel: DataRecordPathElement,
) {
  if (childRecord) {
    acc = [
      ...acc,
      { record: childRecord, parentElements: [rel] },
      ...dataRecordFns
        .childRecords(models, childRecord)
        .map((r) => dataRecordAndPathFns.prefix(rel, r)),
    ]
  }
  return acc
}

export const dataRecordFns = {
  newInstance: (model: Model, creatorId: string): DataRecord => {
    return {
      _type: 'data.record',
      id: {
        _type: 'data.record.id',
        value: uuids.v4(),
      },
      createdBy: { _type: 'user.id', value: creatorId },
      createdMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      modelId: model.id,
      values: {},
    }
  },
  fullStructure(
    models: Model[],
    dataRecord: DataRecord,
    createdBy = dataRecord.createdBy,
  ): DataRecord {
    const model = modelFns.findById(models, dataRecord.modelId)
    return model.nestedModels.reduce((acc, rel) => {
      if (rel._type === 'nested.model') {
        if (rel.cardinality === 'one') {
          if (!acc.values[rel.id.value]) {
            acc.values[rel.id.value] = dataRecordFns.newInstance(
              modelFns.findById(models, rel.modelId),
              createdBy.value,
            )
          }
          acc.values[rel.id.value] = this.fullStructure(models, acc.values[rel.id.value])
        } else {
          if (!acc.values[rel.id.value]) {
            acc.values[rel.id.value] = []
          } else {
            acc.values[rel.id.value] = acc.values[rel.id.value].map((r: DataRecord) =>
              this.fullStructure(models, r),
            )
          }
        }
      }
      return acc
    }, dataRecord)
  },
  random: (models: Model[], model: Model, givenValues: { [key: string]: any } = {}): DataRecord => {
    let record: DataRecord = {
      _type: 'data.record',
      id: { _type: 'data.record.id', value: uuids.v4() },
      modelId: model.id,
      createdBy: { _type: 'user.id', value: 'random' },
      createdMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      values: {},
    }
    record = model.slots.reduce((record, slot) => {
      if (slot._type === 'model.reference' || slot._type === 'inlined.model.reference') {
        return record
      }
      const givenValue = givenValues[slot.name.value]
      const hasGivenValue = givenValue !== undefined
      const value = hasGivenValue ? givenValue : propertyDescriptors.mandatory(slot).randomValue()
      return modelFns.setPropertyValue(model, slot, value, record)
    }, record)
    record = model.nestedModels.reduce((record, nestedModel) => {
      if (nestedModel.cardinality === 'one') {
        const givenValue = givenValues[nestedModel.name.value]
        if (givenValue) {
          if (givenValue._type === 'data.record') {
            record.values[nestedModel.id.value] = givenValue
          } else {
            const relatedModel = modelFns.findById(models, nestedModel.modelId)
            record.values[nestedModel.id.value] = dataRecordFns.random(
              models,
              relatedModel,
              givenValue,
            )
          }
        }
      }
      if (nestedModel.cardinality === 'many') {
        const givenValue = givenValues[nestedModel.name.value]
        if (givenValue) {
          if (!Array.isArray(givenValue)) {
            throw new Error(`Given value for ${nestedModel.name.value} is not an array`)
          }
          record.values[nestedModel.id.value] = givenValue
        }
      }
      return record
    }, record)
    return record
  },
  childRecordByName(models: Model[], record: DataRecord, ...names: string[]): DataRecord {
    const dottedNamePath = dottedPathFns.dottedNamePath(names.join('.'))
    const pathElements = dataRecordPathElementFns.fromDottedNamePath(
      models,
      modelFns.findById(models, record.modelId),
      dottedNamePath,
    )
    return mandatory(
      dataRecordPathElementFns.getNestedRecord(models, record, pathElements),
      `Child record not found for path ${dottedNamePath.value}`,
    )
  },
  childRecords: (models: Model[], record: DataRecord): DataRecordAndPath[] => {
    const model = modelFns.findById(models, record.modelId)
    return model.nestedModels.reduce((acc, nested) => {
      if (nested.cardinality === 'one') {
        const childRecord = record.values[nested.id.value] ?? null
        acc = getChildRecord(models, childRecord, acc, nested)
      } else {
        const childRecords = record.values[nested.id.value] ?? []
        acc = [
          ...acc,
          ...childRecords.flatMap((cr: DataRecord, index: number) =>
            getChildRecord(models, cr, acc, nestedRecordArrayPathElement(nested, index)),
          ),
        ]
      }
      return acc
    }, [] as DataRecordAndPath[])
  },
}
