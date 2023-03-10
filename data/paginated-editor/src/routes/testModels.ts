import { modelFns, modelOptions, relationshipFns } from '@cozemble/model-api'
import { stringPropertyFns, stringPropertyOptions } from '@cozemble/model-string-core'

const addressModel = modelFns.newInstance(
  'Address',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Line 1', stringPropertyOptions.required),
    stringPropertyFns.newInstance('Line 2'),
    stringPropertyFns.newInstance('Post code', stringPropertyOptions.required),
  ),
)

export const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('First name', stringPropertyOptions.required),
    stringPropertyFns.newInstance('Last name'),
    stringPropertyFns.newInstance(
      'Phone',
      stringPropertyOptions.unique,
      stringPropertyOptions.validation(
        '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
        'Must be a valid phone number',
      ),
    ),
    stringPropertyFns.newInstance(
      'Email',
      stringPropertyOptions.unique,
      stringPropertyOptions.validation(
        '^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$',
        'Must be a valid email address',
      ),
    ),
  ),
  modelOptions.withRelationships(relationshipFns.newInstance('Address', addressModel.id, 'one')),
)

export const lineItemModel = modelFns.newInstance(
  'Line Item',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Quantity', stringPropertyOptions.required),
    stringPropertyFns.newInstance('Name', stringPropertyOptions.required),
    stringPropertyFns.newInstance('Price', stringPropertyOptions.required),
  ),
)
export const invoiceModel = modelFns.newInstance(
  'Invoice',
  modelOptions.withProperties(
    stringPropertyFns.newInstance('Invoice ID', stringPropertyOptions.required),
  ),
  modelOptions.withRelationships(
    relationshipFns.newInstance('Customer', customerModel.id, 'one'),
    relationshipFns.newInstance('Line Items', lineItemModel.id, 'many'),
  ),
)

export const allModels = [invoiceModel, customerModel, lineItemModel, addressModel]
