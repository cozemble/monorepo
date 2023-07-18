import { getContext, setContext } from 'svelte'

const recordButtonExtensionsContextKey = 'com.cozemble.datatable.recordButtonExtensions'

type SvelteComponentAndProps = { component: any; props: { [key: string]: any } }

export const editorExtensions = {
  registerRecordButtonExtensions: function (component: any, props = {}) {
    setContext(recordButtonExtensionsContextKey, { component, props })
  },
  getRecordButtonExtensions: function (): SvelteComponentAndProps | undefined {
    return getContext(recordButtonExtensionsContextKey)
  },
}
