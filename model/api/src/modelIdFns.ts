import { uuids } from '@cozemble/lang-util'
import type { ModelId } from '@cozemble/model-core'

export const modelIdFns = {
  newInstance: (value = uuids.v4()): ModelId => {
    return {
      _type: 'model.id',
      value,
    }
  },
  equals(a: ModelId, b: ModelId): boolean {
    return a.value === b.value
  },
}
