import { modelFns, modelOptions, nestedModelFns, propertyFns } from '@cozemble/model-api'
import type { Model } from '@cozemble/model-core'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { DataRecord } from '@cozemble/model-core'

export const testModelsLocalStorageKey = 'com.cozemble.datatable.cypress.models'
export const testRecordsLocalStorageKey = 'com.cozemble.datatable.cypress.records'

export const addressModel = modelFns.newInstance(
  'Address',
  modelOptions.withProperty(propertyFns.newInstance('Street')),
  modelOptions.withProperty(propertyFns.newInstance('Post code')),
)

export const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withProperty(propertyFns.newInstance('First name')),
  modelOptions.withProperty(propertyFns.newInstance('Last name')),
  modelOptions.withNestedModels(nestedModelFns.newInstance('Address', addressModel.id, 'one')),
)

addressModel.parentModelId = customerModel.id

export function storeModels(models: Model[]) {
  const eventSourcedModels = models.map((model) => eventSourcedModelFns.newInstance(model))
  localStorage.setItem(testModelsLocalStorageKey, JSON.stringify(eventSourcedModels))
}

export function storeRecords(records: DataRecord[]) {
  localStorage.setItem(testRecordsLocalStorageKey, JSON.stringify(records))
}
