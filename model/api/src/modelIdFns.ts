import { uuids } from '@cozemble/lang-util'
import { ModelId } from '@cozemble/model-core'

export const modelIdFns = {
  newInstance: (id = uuids.v4()): ModelId => {
    return {
      _type: 'model.id',
      id,
    }
  },
  equals(a: ModelId, b: ModelId): boolean {
    return a.id === b.id
  },
}
