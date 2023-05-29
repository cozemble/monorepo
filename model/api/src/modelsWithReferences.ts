import { modelFns, modelOptions } from './modelsFns'
import { stringPropertyFns, stringPropertyOptions } from '@cozemble/model-string-core'
import { modelIdFns, modelReferenceFns } from '@cozemble/model-core'

const addressModel = modelFns.newInstance(
  'Address',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Post code', stringPropertyOptions.required),
  ),
)

const customerModelId = modelIdFns.newInstance('customer-model')
const invoiceModelId = modelIdFns.newInstance('invoice-model')
const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withId(customerModelId),
  modelOptions.withProperties(
    stringPropertyFns.newInstance('First name', stringPropertyOptions.required),
  ),
  modelOptions.withSlot(modelReferenceFns.forwardModelReference(customerModelId, addressModel)),
)

const invoiceModel = modelFns.newInstance(
  'Invoice',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Invoice ID', stringPropertyOptions.required),
  ),
  modelOptions.withSlot(modelReferenceFns.forwardModelReference(invoiceModelId, customerModel)),
)

export const modelsWithReferences = {
  addressModel,
  customerModel,
  invoiceModel,
}

export const allModelsWithReferences = [addressModel, customerModel, invoiceModel]
