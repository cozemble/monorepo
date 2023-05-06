import type { Writable } from 'svelte/store'
import { getContext, setContext } from 'svelte'

const permitModellingContextKey = 'com.cozemble.incremental.model.permitModelling'
const showDevConsoleContextKey = 'com.cozemble.incremental.model.showDevConsole'

export const contextHelper = {
  setPermitModelling: (permitModelling: Writable<boolean>) => {
    setContext(permitModellingContextKey, permitModelling)
  },
  getPermitModelling: (): Writable<boolean> => {
    return getContext(permitModellingContextKey)
  },
  setShowDevConsole: (showDevConsole: Writable<boolean>) => {
    setContext(showDevConsoleContextKey, showDevConsole)
  },
  getShowDevConsole: (): Writable<boolean> => {
    return getContext(showDevConsoleContextKey)
  },
}
