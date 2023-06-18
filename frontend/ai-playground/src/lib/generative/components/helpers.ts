import type { JsonSchema, JsonSchemaProperty, Model, Property } from '@cozemble/model-core'
import {
  modelEventDescriptors,
  modelPluralNameFns,
  propertyDescriptors,
  propertyNameFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { modelFns, propertyOptions } from '@cozemble/model-api'
import {
  jsonStringPropertyFns,
  jsonStringPropertyOptions,
  phoneNumberPropertyType,
} from '@cozemble/model-properties-core'
import type { Option } from '@cozemble/lang-util'
import { options, strings } from '@cozemble/lang-util'
import {
  eventSourcedModelFns,
  eventSourcedModelListFns,
} from '@cozemble/model-event-sourced/dist/esm'
import { modelStore, navbarState } from '$lib/generative/stores'

const systemConfiguration = systemConfigurationFns.empty()

function addProperty(model: Model, propertyKey: string, property: JsonSchemaProperty): Model {
  const propertyName = propertyNameFns.newInstance(strings.camelcaseToSentenceCase(propertyKey))
  const propOptions: Option[] = [propertyOptions.named(propertyName)]
  if (property.unique) {
    propOptions.push(propertyOptions.unique)
  }
  if (property.required) {
    propOptions.push(propertyOptions.required)
  }
  if (property.type === 'string') {
    if (property.format === 'phone') {
      const pd = propertyDescriptors.mandatory(phoneNumberPropertyType)
      const event = pd.newProperty(systemConfiguration, model.id, propertyName)
      model = modelEventDescriptors.applyEvent(model, event)
      let phoneNumberProperty = model.slots.at(-1)
      phoneNumberProperty = options.apply(phoneNumberProperty, ...propOptions) as Property
      return { ...model, slots: [...model.slots.slice(0, -1), phoneNumberProperty] }
    }
    if (property.pattern) {
      propOptions.push(jsonStringPropertyOptions.pattern(property.pattern, 'Invalid format'))
    }
    return {
      ...model,
      slots: [...model.slots, jsonStringPropertyFns.newInstance(propertyKey, ...propOptions)],
    }
  }
  return model
}

export function convertSchemaToModels(schema: JsonSchema): { model: Model; allModels: Model[] } {
  let model = modelFns.newInstance(schema.title ?? 'Untitled')
  if (schema.pluralTitle) {
    model.pluralName = modelPluralNameFns.newInstance(schema.pluralTitle)
  }
  model = Object.keys(schema.properties).reduce((model, propertyKey) => {
    const property = schema.properties[propertyKey]
    if (property.type === 'string') {
      model = addProperty(model, propertyKey, property)
    }
    return model
  }, model)

  return { model, allModels: [model] }
}

export function reconfigureApp(config: { model: Model; allModels: Model[] }) {
  const eventSourcedModels = config.allModels.map((m) => eventSourcedModelFns.newInstance(m))
  modelStore.update(() => eventSourcedModelListFns.newInstance(eventSourcedModels))
  navbarState.set(config.model.id.value)
}
