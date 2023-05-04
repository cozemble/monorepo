import { writable } from 'svelte/store'

export interface Naming {
  modelNameSingular: string
  modelNamePlural: string
}

function defaultModelNaming(): Naming {
  return {
    modelNameSingular: 'Model',
    modelNamePlural: 'Models',
  }
}

export function customNaming(modelNameSingular: string, modelNamePlural: string) {
  const custom = {
    modelNameSingular,
    modelNamePlural,
  }
  naming.set(custom)
}

export const naming = writable(defaultModelNaming())
