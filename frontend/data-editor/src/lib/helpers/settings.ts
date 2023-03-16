import _ from 'lodash'
import { getContext, setContext } from 'svelte'

export const handleOverrides = (model: CozJSONSchema) => {
  const overrides = model.coz?.overrides

  const overridesCtx = getContext('overrides')

  if (!overrides && !overridesCtx) return // no need to handle overrides if there are none

  setContext('overrides', _.merge(overridesCtx, overrides)) // merge overrides into context
}

export const getOverrides = () => getContext('overrides') as JSONSchemaCozembleConfigs['overrides']
