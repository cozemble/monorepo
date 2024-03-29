import type { ModelSlot, Property } from '@cozemble/model-core'
import { propertyDescriptors } from '@cozemble/model-core'
import { modelReferenceFns } from '@cozemble/model-core'

function validateProperty(property: Property): Map<string, string> {
  return propertyDescriptors.mandatory(property).validateProperty(property)
}

export function validateSlot(slot: ModelSlot): Map<string, string> {
  if (slot._type === 'property') {
    return validateProperty(slot)
  }
  if (slot._type === 'model.reference') {
    return modelReferenceFns.validate(slot)
  }
  throw new Error(`Cannot validate a model slot of type ${slot._type}`)
}
