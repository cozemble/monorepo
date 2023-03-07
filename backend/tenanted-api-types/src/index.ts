import { Model, ModelEvent } from '@cozemble/model-core'

export interface BackendModelEvent {
  id: string
  definition: ModelEvent
}

export interface BackendModel {
  id: string
  name: string
  definition: Model
  events: BackendModelEvent[]
}

export interface BackendTenant {
  id: string
  name: string
  models: BackendModel[]
}

export function accessTokenKey(userPool: string) {
  if (userPool !== 'root') {
    throw new Error('To do: deal with nested tenants')
  }
  return `cozauth.accessToken.${userPool}`
}

export function refreshTokenKey(userPool: string) {
  if (userPool !== 'root') {
    throw new Error('To do: deal with nested tenants')
  }
  return `cozauth.refreshToken.${userPool}`
}
