import { modelFns, modelOptions } from '@cozemble/model-api'
import { stringProperties, stringPropertyOptions } from '@cozemble/model-string-core'

export const customerModel = modelFns.newInstance(
  'Customer',
  modelOptions.withProperties(
    stringProperties.newInstance('First name', stringPropertyOptions.required),
    stringProperties.newInstance('Last name'),
    stringProperties.newInstance(
      'Phone',
      stringPropertyOptions.unique,
      stringPropertyOptions.validation(
        '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
        'Must be a valid phone number',
      ),
    ),
    stringProperties.newInstance(
      'Email',
      stringPropertyOptions.unique,
      stringPropertyOptions.validation(
        '^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$',
        'Must be a valid email address',
      ),
    ),
  ),
)
