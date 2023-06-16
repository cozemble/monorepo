import { modelFns, modelOptions } from './modelsFns'
import { modelIdFns, modelReferenceFns } from '@cozemble/model-core'
import { jsonStringPropertyFns, jsonStringPropertyOptions } from '@cozemble/model-properties-core'

const addressModel = modelFns.newInstance(
  'Address',
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('Post code', jsonStringPropertyOptions.required),
  ),
)

const customerModelId = modelIdFns.newInstance('customer-model')
const invoiceModelId = modelIdFns.newInstance('invoice-model')
const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withId(customerModelId),
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('First name', jsonStringPropertyOptions.required),
  ),
  modelOptions.withSlot(modelReferenceFns.forwardModelReference(customerModelId, addressModel)),
)

const invoiceModel = modelFns.newInstance(
  'Invoice',
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('Invoice ID', jsonStringPropertyOptions.required),
  ),
  modelOptions.withSlot(modelReferenceFns.forwardModelReference(invoiceModelId, customerModel)),
)

export const modelsWithReferences = {
  addressModel,
  customerModel,
  invoiceModel,
}

export const allModelsWithReferences = [addressModel, customerModel, invoiceModel]
