import { modelFns, modelOptions } from '@cozemble/model-api'
import { stringPropertyFns, stringPropertyOptions } from '@cozemble/model-string-core'

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
)
