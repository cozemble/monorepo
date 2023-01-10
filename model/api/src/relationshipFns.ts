import type { Cardinality, ModelId, Relationship, RelationshipName } from '@cozemble/model-core'
import { relationshipIdFns, relationshipNameFns } from '@cozemble/model-core'

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
}
