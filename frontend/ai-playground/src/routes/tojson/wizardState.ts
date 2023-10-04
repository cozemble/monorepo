import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'

export interface GeneratingFirstJson {
  _type: 'generatingFirstJson'
}

export interface ExplainingFirstJson {
  _type: 'explainingFirstJson'
}

export interface StartApiCreation {
  _type: 'startApiCreation'
}

export interface StartJsonImprovement {
  _type: 'startJsonImprovement'
}

export interface ApplyJsonSchema {
  _type: 'applyJsonSchema'
}

export interface GenerateJsonSchema {
  _type: 'generateJsonSchema'
}

export interface DisplayOptions {
  _type: 'displayOptions'
}

export interface ChangeTables {
  _type: 'changeTables'
}

export interface MergeTables {
  _type: 'mergeTables'
}

export const generatingFirstJson: GeneratingFirstJson = {
  _type: 'generatingFirstJson',
}

export const explainingFirstJson: ExplainingFirstJson = {
  _type: 'explainingFirstJson',
}

export const startApiCreation: StartApiCreation = {
  _type: 'startApiCreation',
}

export const startJsonImprovement: StartJsonImprovement = {
  _type: 'startJsonImprovement',
}

export const applyJsonSchema: ApplyJsonSchema = {
  _type: 'applyJsonSchema',
}

export const generateJsonSchema: GenerateJsonSchema = {
  _type: 'generateJsonSchema',
}

export const displayOptions: DisplayOptions = {
  _type: 'displayOptions',
}

export const changeTables: ChangeTables = {
  _type: 'changeTables',
}

export const mergeTables: MergeTables = {
  _type: 'mergeTables',
}

export function nextWizardState(wizardState: WizardState): WizardState {
  switch (wizardState._type) {
    case 'generatingFirstJson':
      return explainingFirstJson
  }
  return wizardState
}

export type WizardState =
  | GeneratingFirstJson
  | ExplainingFirstJson
  | StartApiCreation
  | StartJsonImprovement
  | ApplyJsonSchema
  | GenerateJsonSchema
  | DisplayOptions
  | ChangeTables
  | MergeTables

export interface WizardStateStore extends Writable<WizardState> {
  history(): WizardState[]
}

export function wizardStateStore(initialState: WizardState): WizardStateStore {
  const underlying = writable<WizardState>(initialState)
  const history: WizardState[] = [generatingFirstJson]
  return {
    subscribe: underlying.subscribe,
    history: () => history,
    set: (wizardState: WizardState) => {
      history.push(wizardState)
      underlying.set(wizardState)
    },
    update: (updater: (wizardState: WizardState) => WizardState) => {
      const newWizardState = updater(get(underlying))
      history.push(newWizardState)
      underlying.update(updater)
    },
  }
}

export type TableAction = 'mergeTables' | 'extractRows' | 'deleteRows'
