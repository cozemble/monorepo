import { uuids } from '@cozemble/lang-util'
import { ModelId } from './core.js'

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
