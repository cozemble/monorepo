import type { JsonProperty } from '@cozemble/model-core'
import {
  isJsonProperty,
  modelEventDescriptors,
  modelIdFns,
  propertyNameFns,
} from '@cozemble/model-core'
import { modelFns } from '@cozemble/model-api'
import type { PropertyDescriptor } from '@cozemble/model-core'

/**
 * Its quite tricky to get a default configuration for a property type, as it depends on the
 * construction of a property in a model.  Adding a default configuration to the property descriptor
 * pull things out of shape
 */
export function makeArrayItemProperty(pd: PropertyDescriptor): JsonProperty {
  const newPropertyEvent = pd.newProperty(
    modelIdFns.newInstance(),
    propertyNameFns.newInstance('Array Item Property'),
  )
  const model = modelEventDescriptors.applyEvent(modelFns.newInstance('Model'), newPropertyEvent)
  if (model.slots.length !== 1) {
    throw new Error(`Expected model to have 1 property, but found ${model.slots.length}`)
  }
  const slot = model.slots[0]
  if (!isJsonProperty(slot)) {
    throw new Error(`Expected slot to be a json property, but found ${slot._type}`)
  }
  return slot
}
