import { modelFns, modelOptions } from './modelsFns'
import { stringPropertyFns, stringPropertyOptions } from '@cozemble/model-string-core'
import { modelReferenceFns } from '@cozemble/model-core'

const addressModel = modelFns.newInstance(
  'Address',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Post code', stringPropertyOptions.required),
  ),
)

const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('First name', stringPropertyOptions.required),
  ),
  modelOptions.withSlot(modelReferenceFns.newInstance([addressModel.id], 'Address')),
)

const invoiceModel = modelFns.newInstance(
  'Invoice',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Invoice ID', stringPropertyOptions.required),
  ),
  modelOptions.withSlot(modelReferenceFns.newInstance([customerModel.id], 'Customer')),
)

export const modelsWithReferences = {
  addressModel,
  customerModel,
  invoiceModel,
}

export const allModelsWithReferences = [addressModel, customerModel, invoiceModel]
