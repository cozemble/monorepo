import { Model, ModelEvent } from '@cozemble/model-core'

export interface CreateTenant {
  _type: 'create.tenant'
  id: string
  name: string
  owner: {
    userPool: string
    id: string
    email: string
    firstName: string
  }
}

export interface BackendModel {
  _type: 'backend.model'
  model: Model
  events: ModelEvent[]
}

export interface Tenant {
  _type: 'tenant'
  id: string
  name: string
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

export {
  SavableRecords,
  SavableRecord,
  JsonPath,
  savableRecords,
  fetchedRecords,
  FetchedRecords,
  SuccessfulSaveResponse,
} from './records.js'

export { ErrorType, ConflictErrorType } from './errorsTypes.js'

export {
  FilledFilterInstanceGroup,
  FilledFilterInstance,
  Value,
  RhsValue,
  FilterRequestPayload,
  filterRequestPayloadFns,
  filledFilterInstanceGroupFns,
} from './filters.js'
