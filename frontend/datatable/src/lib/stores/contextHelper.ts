import type { Writable } from 'svelte/store'
import { getContext, setContext } from 'svelte'

const permitModellingContextKey = 'com.cozemble.incremental.model.permitModelling'

export const contextHelper = {
  setPermitModelling: (permitModelling: Writable<boolean>) => {
    setContext(permitModellingContextKey, permitModelling)
  },
  getPermitModelling: (): Writable<boolean> => {
    return getContext(permitModellingContextKey)
  },
}
