import { Model } from '@cozemble/model-core'
import { getContext, setContext } from 'svelte'
import { Readable, Writable } from 'svelte/store'

const formErrorStateContext = 'com.cozemble.model.editor.property.edit.form.error.state.context'
const modelsStateContext = 'com.cozemble.model.editor.property.edit.models.context'

export type FormErrorState = {
  _type: 'form.error.state'
  showErrors: boolean
}

export function emptyFormErrorState(): FormErrorState {
  return {
    _type: 'form.error.state',
    showErrors: false,
  }
}

export const editorHost = {
  setErrorState: (state: Writable<FormErrorState>) => {
    setContext(formErrorStateContext, state)
  },
  setModels: (state: Readable<Model[]>) => {
    setContext(modelsStateContext, state)
  },
}

export const editorClient = {
  getErrorState: (): Writable<FormErrorState> => {
    return getContext(formErrorStateContext)
  },
  getModels: (): Readable<Model[]> => {
    return getContext(modelsStateContext)
  },
}
