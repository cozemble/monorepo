import type {
  Cardinality,
  Model,
  ModelId,
  Relationship,
  RelationshipName,
} from '@cozemble/model-core'
import {
  type DataRecord,
  type HasOneRelationship,
  type HasManyRelationship,
  relationshipIdFns,
  relationshipNameFns,
} from '@cozemble/model-core'
import { modelFns } from './modelsFns'

export const relationshipFns = {
  newInstance: (
    name: string | RelationshipName,
    relatedModelId: ModelId,
    cardinality: Cardinality,
  ): Relationship => {
    return {
      _type: 'relationship',
      subType: cardinality === 'one' ? 'has.one.relationship' : 'has.many.relationship',
      modelId: relatedModelId,
      id: relationshipIdFns.newInstance(),
      name: typeof name === 'string' ? relationshipNameFns.newInstance(name) : name,
    }
  },
  setValue(
    models: Model[],
    record: DataRecord,
    relationship: Relationship,
    value: DataRecord | DataRecord[] | null,
  ): DataRecord {
    const model = modelFns.findById(models, record.modelId)
    const element = modelFns.maybeElementById(model, relationship.id.value)
    if (!element) {
      throw new Error(`Could not find element with id ${relationship.id.value}`)
    }
    if (element._type !== 'relationship') {
      throw new Error(`Element with id ${relationship.id.value} is not a relationship`)
    }
    if (relationship.subType === 'has.one.relationship') {
      if (Array.isArray(value)) {
        throw new Error('Cannot set a has.one.relationship to an array of values')
      }
    } else {
      if (!Array.isArray(value)) {
        throw new Error('Cannot set a has.many.relationship to a non-array value')
      }
    }
    return { ...record, values: { ...record.values, [relationship.id.value]: value } }
  },
  getValue(record: DataRecord, relationship: Relationship): DataRecord | DataRecord[] | null {
    if (record === null || record === undefined) {
      return null
    }
    if (relationship.subType === 'has.one.relationship') {
      return record.values[relationship.id.value]
    }
    return record.values[relationship.id.value] ?? []
  },
  getOneValue(record: DataRecord, relationship: HasOneRelationship): DataRecord | null {
    if (record === null || record === undefined) {
      return null
    }
    return record.values[relationship.id.value] ?? null
  },
  getManyValues(record: DataRecord, relationship: HasManyRelationship): DataRecord[] | null {
    if (record === null || record === undefined) {
      return null
    }
    return record.values[relationship.id.value] ?? null
  },
}
