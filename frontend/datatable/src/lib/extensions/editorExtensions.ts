import { getContext, setContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'

const recordButtonExtensionsContextKey = 'com.cozemble.context.datatable.recordButtonExtensions'
const switchableModelPaneContextKey = 'com.cozemble.context.datatable.switchableModelPane'

type SvelteComponentAndProps = { component: any; props: { [key: string]: any } }

const switchedModelPane = writable(null as SvelteComponentAndProps | null)

export const editorExtensions = {
  register: function () {
    setContext(switchableModelPaneContextKey, switchedModelPane)
  },
  registerRecordButtonExtensions: function (component: any, props = {}) {
    setContext(recordButtonExtensionsContextKey, { component, props })
  },
  getRecordButtonExtensions: function (): SvelteComponentAndProps | undefined {
    return getContext(recordButtonExtensionsContextKey)
  },
  getSwitchableModelPane: function (): Writable<SvelteComponentAndProps | null> {
    return getContext(switchableModelPaneContextKey)
  },
  switchModelPane: function (pane: SvelteComponentAndProps | null) {
    switchedModelPane.set(pane)
  },
}
