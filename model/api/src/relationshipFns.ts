import type { Cardinality, ModelId, Relationship, RelationshipName } from '@cozemble/model-core'
import { relationshipIdFns, relationshipNameFns } from '@cozemble/model-core'
import { DataRecord } from '@cozemble/model-core/dist/esm'

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
  getValue(record: DataRecord, relationship: Relationship): DataRecord | DataRecord[] | null {
    if (record === null || record === undefined) {
      return null
    }
    if (relationship.subType === 'has.one.relationship') {
      return record.values[relationship.id.value]
    }
    return record.values[relationship.id.value] ?? []
  },
}
