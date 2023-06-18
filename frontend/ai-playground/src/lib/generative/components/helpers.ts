import type { JsonSchema, JsonSchemaProperty, Model, Property } from '@cozemble/model-core'
import {
  modelEventDescriptors,
  modelPluralNameFns,
  type PropertyDescriptor,
  propertyDescriptors,
  propertyNameFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { modelFns, propertyOptions } from '@cozemble/model-api'
import {
  datePropertyType,
  emailPropertyType,
  jsonStringPropertyOptions,
  numberPropertyType,
  phoneNumberPropertyType,
  stringPropertyType,
  timePropertyType,
} from '@cozemble/model-properties-core'
import type { Option } from '@cozemble/lang-util'
import { options, strings } from '@cozemble/lang-util'
import { eventSourcedModelFns, eventSourcedModelListFns } from '@cozemble/model-event-sourced'
import { modelStore, navbarState } from '$lib/generative/stores'
import type { Cardinality, NestedModel } from '@cozemble/model-core/dist/esm'
import { nestedModelFns } from '@cozemble/model-api/dist/esm'

const systemConfiguration = systemConfigurationFns.empty()

function getPropertyDescriptor(property: JsonSchemaProperty): PropertyDescriptor | null {
  if (property.type === 'string') {
    if (property.format === 'phone') {
      return propertyDescriptors.mandatory(phoneNumberPropertyType)
    }
    if (property.format === 'email') {
      return propertyDescriptors.mandatory(emailPropertyType)
    }
    if (property.format === 'date') {
      return propertyDescriptors.mandatory(datePropertyType)
    }
    if (property.format === 'time') {
      return propertyDescriptors.mandatory(timePropertyType)
    }
    return propertyDescriptors.mandatory(stringPropertyType)
  }
  if (property.type === 'number') {
    return propertyDescriptors.mandatory(numberPropertyType)
  }
  return null
}

function addProperty(model: Model, propertyKey: string, property: JsonSchemaProperty): Model {
  const propertyName = propertyNameFns.newInstance(strings.camelcaseToSentenceCase(propertyKey))
  const propOptions: Option[] = [propertyOptions.named(propertyName)]
  if (property.unique) {
    propOptions.push(propertyOptions.unique)
  }
  if (property.required) {
    propOptions.push(propertyOptions.required)
  }
  if (property.pattern) {
    propOptions.push(jsonStringPropertyOptions.pattern(property.pattern, 'Invalid format'))
  }
  const pd = getPropertyDescriptor(property)
  if (!pd) {
    return model
  }
  const event = pd.newProperty(systemConfiguration, model.id, propertyName)
  model = modelEventDescriptors.applyEvent(model, event)
  let phoneNumberProperty = model.slots.at(-1)
  phoneNumberProperty = options.apply(phoneNumberProperty, ...propOptions) as Property
  return { ...model, slots: [...model.slots.slice(0, -1), phoneNumberProperty] }
}

type ModelAndAllModels = { model: Model; allModels: Model[] }

function foldProperties(
  properties: Record<string, JsonSchemaProperty>,
  modelAndAllModels: ModelAndAllModels,
): ModelAndAllModels {
  return Object.keys(properties).reduce((modelAndAll, propertyKey) => {
    const property = properties[propertyKey]
    if (property.type === 'object') {
      const cardinality: Cardinality = 'one'
      const sentenceCase = strings.camelcaseToSentenceCase(propertyKey)
      const innerModel = modelFns.newInstance(sentenceCase)
      innerModel.parentModelId = modelAndAll.model.id
      const innerModelAndAll = foldProperties(property.properties ?? {}, {
        model: innerModel,
        allModels: [innerModel],
      })
      const nestedModel: NestedModel = nestedModelFns.newInstance(
        sentenceCase,
        innerModel.id,
        cardinality,
      )
      modelAndAll.model = {
        ...modelAndAll.model,
        nestedModels: [...modelAndAll.model.nestedModels, nestedModel],
      }
      modelAndAll.allModels = [...modelAndAll.allModels, ...innerModelAndAll.allModels]
    } else if (property.type === 'array') {
      console.log('TODO: handle array')
    } else {
      modelAndAll.model = addProperty(modelAndAll.model, propertyKey, property)
      modelAndAll.allModels = modelAndAll.allModels.map((m) =>
        m.id.value === modelAndAll.model.id.value ? modelAndAll.model : m,
      )
    }
    return modelAndAll
  }, modelAndAllModels)
}

export function convertSchemaToModels(schema: JsonSchema): ModelAndAllModels {
  const model = modelFns.newInstance(schema.title ?? 'Untitled')
  if (schema.pluralTitle) {
    model.pluralName = modelPluralNameFns.newInstance(schema.pluralTitle)
  }
  return foldProperties(schema.properties, { model, allModels: [model] })
}

export function reconfigureApp(config: { model: Model; allModels: Model[] }) {
  const eventSourcedModels = config.allModels.map((m) => eventSourcedModelFns.newInstance(m))
  modelStore.update(() => eventSourcedModelListFns.newInstance(eventSourcedModels))
  navbarState.set(config.model.id.value)
}
