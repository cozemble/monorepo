import { modelFns, modelOptions, nestedModelFns } from '@cozemble/model-api'
import { jsonStringPropertyFns, jsonStringPropertyOptions } from '@cozemble/model-properties-core'

const addressModel = modelFns.newInstance(
  'Address',
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('Line 1', jsonStringPropertyOptions.required),
    jsonStringPropertyFns.newInstance('Line 2'),
    jsonStringPropertyFns.newInstance('Post code', jsonStringPropertyOptions.required),
  ),
)

export const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('First name', jsonStringPropertyOptions.required),
    jsonStringPropertyFns.newInstance('Last name'),
    jsonStringPropertyFns.newInstance(
      'Phone',
      jsonStringPropertyOptions.unique,
      jsonStringPropertyOptions.pattern(
        '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
        'Must be a valid phone number',
      ),
    ),
    jsonStringPropertyFns.newInstance(
      'Email',
      jsonStringPropertyOptions.unique,
      jsonStringPropertyOptions.pattern(
        '^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$',
        'Must be a valid email address',
      ),
    ),
  ),
  modelOptions.withNestedModels(nestedModelFns.newInstance('Address', addressModel.id, 'one')),
)

export const lineItemModel = modelFns.newInstance(
  'Line Item',
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('Quantity', jsonStringPropertyOptions.required),
    jsonStringPropertyFns.newInstance('Name', jsonStringPropertyOptions.required),
    jsonStringPropertyFns.newInstance('Price', jsonStringPropertyOptions.required),
  ),
)
export const invoiceModel = modelFns.newInstance(
  'Invoice',
  modelOptions.withProperties(
    jsonStringPropertyFns.newInstance('Invoice ID', jsonStringPropertyOptions.required),
  ),
  modelOptions.withNestedModels(
    nestedModelFns.newInstance('Customer', customerModel.id, 'one'),
    nestedModelFns.newInstance('Line Items', lineItemModel.id, 'many'),
  ),
)

export const allModels = [invoiceModel, customerModel, lineItemModel, addressModel]
