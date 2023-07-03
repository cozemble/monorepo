import type {
  Cardinality,
  JsonSchema,
  JsonSchemaProperty,
  Model,
  ModelId,
  NestedModel,
  Property,
} from '@cozemble/model-core'
import {
  modelEventDescriptors,
  modelPluralNameFns,
  type PropertyDescriptor,
  propertyDescriptors,
  propertyNameFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { modelFns, nestedModelFns, propertyOptions } from '@cozemble/model-api'
import {
  datePropertyType,
  emailPropertyType,
  integerPropertyType,
  jsonStringPropertyOptions,
  numberPropertyType,
  phoneNumberPropertyType,
  stringPropertyType,
  timePropertyType,
} from '@cozemble/model-properties-core'
import type { Option } from '@cozemble/lang-util'
import { justErrorMessage, mandatory, options, strings } from '@cozemble/lang-util'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns, eventSourcedModelListFns } from '@cozemble/model-event-sourced'
import { modelStore, navbarState, promptIndex } from '$lib/generative/stores'
import { get } from 'svelte/store'
import { useSameSlotIds } from '$lib/generative/useSameSlotIds'
import type { AttachmentPropertyConfiguration } from '@cozemble/model-attachment-core'
import { attachmentPropertyType } from '@cozemble/model-attachment-core'

const systemConfiguration = systemConfigurationFns.empty()

function getAttachmentConfig(property: JsonSchemaProperty): AttachmentPropertyConfiguration {
  const config: AttachmentPropertyConfiguration = {}
  if (property.minItems) {
    config.minAttachments = property.minItems
  }
  if (property.maxItems) {
    config.maxAttachments = property.maxItems
  }
  if (property.contentMediaType) {
    if (
      property.contentMediaType.startsWith('image/') ||
      property.contentMediaType.startsWith('audio/') ||
      property.contentMediaType.startsWith('video/')
    ) {
      // change the media type to accept wildcard
      config.accept = property.contentMediaType.replace(/\/.+$/, '/*')
    } else {
      config.accept = property.contentMediaType
    }
  }
  return config
}

function getPropertyDescriptor(property: JsonSchemaProperty): {
  pd: PropertyDescriptor | null
  config?: any
} {
  if (property.type === 'string') {
    if (property.contentMediaType) {
      return {
        pd: propertyDescriptors.mandatory(attachmentPropertyType),
        config: getAttachmentConfig(property),
      }
    }
    if (property.format === 'phone') {
      return { pd: propertyDescriptors.mandatory(phoneNumberPropertyType) }
    }
    if (property.format === 'email') {
      return { pd: propertyDescriptors.mandatory(emailPropertyType) }
    }
    if (property.format === 'date') {
      return { pd: propertyDescriptors.mandatory(datePropertyType) }
    }
    if (property.format === 'time') {
      return { pd: propertyDescriptors.mandatory(timePropertyType) }
    }
    return { pd: propertyDescriptors.mandatory(stringPropertyType) }
  }
  if (property.type === 'integer') {
    return { pd: propertyDescriptors.mandatory(integerPropertyType) }
  }
  if (property.type === 'number') {
    return { pd: propertyDescriptors.mandatory(numberPropertyType) }
  }
  return { pd: null }
}

function addProperty(
  model: Model,
  requiredProperties: string[],
  propertyKey: string,
  property: JsonSchemaProperty,
): Model {
  const propertyName = propertyNameFns.newInstance(strings.camelcaseToSentenceCase(propertyKey))
  const propOptions: Option[] = [propertyOptions.named(propertyName)]
  if (property.unique) {
    propOptions.push(propertyOptions.unique)
  }
  if (requiredProperties.includes(propertyKey)) {
    propOptions.push(propertyOptions.required)
  }
  if (property.pattern) {
    propOptions.push(jsonStringPropertyOptions.pattern(property.pattern, 'Invalid format'))
  }
  const { pd, config } = getPropertyDescriptor(property)
  if (!pd) {
    return model
  }
  const event = pd.newProperty(systemConfiguration, model.id, propertyName)
  model = modelEventDescriptors.applyEvent(model, event)
  let slot = mandatory(model.slots.at(-1), `Model ${model.id.value} has no slots`)
  slot = options.apply(slot, ...propOptions) as Property
  if (config) {
    slot = { ...slot, ...config }
  }
  return { ...model, slots: [...model.slots.slice(0, -1), slot] }
}

type ModelAndAllModels = { model: Model; allModels: Model[] }

function handleInnerProperties(
  propertyKey: string,
  modelAndAll: ModelAndAllModels,
  innerProperties: Record<string, JsonSchemaProperty>,
  innerRequiredProperties: string[],
  cardinality: Cardinality,
): ModelAndAllModels {
  const sentenceCase = strings.camelcaseToSentenceCase(propertyKey)
  const innerModel = modelFns.newInstance(sentenceCase)
  innerModel.parentModelId = modelAndAll.model.id
  const innerModelAndAll = foldProperties(innerProperties, innerRequiredProperties, {
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
  modelAndAll.allModels = [
    ...modelAndAll.allModels.map((m) =>
      m.id.value === modelAndAll.model.id.value ? modelAndAll.model : m,
    ),
    ...innerModelAndAll.allModels,
  ]
  return modelAndAll
}

function foldProperties(
  properties: Record<string, JsonSchemaProperty>,
  requiredProperties: string[],
  modelAndAllModels: ModelAndAllModels,
): ModelAndAllModels {
  return Object.keys(properties).reduce((modelAndAll, propertyKey) => {
    const property = properties[propertyKey]
    if (property.type === 'object') {
      return handleInnerProperties(
        propertyKey,
        modelAndAll,
        property.properties ?? {},
        property.required ?? [],
        'one',
      )
    } else if (property.type === 'array') {
      if (!property.items) {
        throw new Error(`Array property ${propertyKey} does not have items defined`)
      }
      if (Array.isArray(property.items)) {
        throw new Error(`Array property ${propertyKey} has multiple items defined`)
      }
      if (property.items.type !== 'object') {
        throw new Error(`Array property ${propertyKey} has items that are not objects`)
      }
      return handleInnerProperties(
        propertyKey,
        modelAndAll,
        property.items.properties ?? {},
        property.items.required ?? [],
        'many',
      )
    } else {
      modelAndAll.model = addProperty(modelAndAll.model, requiredProperties, propertyKey, property)
      modelAndAll.allModels = modelAndAll.allModels.map((m) =>
        m.id.value === modelAndAll.model.id.value ? modelAndAll.model : m,
      )
    }
    return modelAndAll
  }, modelAndAllModels)
}

function reKeyModelIds(
  modelIdMap: { [p: string]: ModelId },
  modelAndAllModels: ModelAndAllModels,
): ModelAndAllModels {
  const reKeyed: { [p: string]: ModelId } = {}
  let allModels = modelAndAllModels.allModels.map((m) => {
    if (modelIdMap[m.name.value]) {
      const newId = modelIdMap[m.name.value]
      reKeyed[m.id.value] = newId
      return { ...m, id: newId }
    }
    return m
  })
  // rekey the parentModelId
  allModels = allModels.map((m) => {
    if (m.parentModelId && reKeyed[m.parentModelId.value]) {
      return { ...m, parentModelId: reKeyed[m.parentModelId.value] }
    }
    return m
  })
  // rekey nestedModels
  allModels = allModels.map((m) => {
    const nestedModels = m.nestedModels.map((nm) => {
      if (reKeyed[nm.modelId.value]) {
        return { ...nm, modelId: reKeyed[nm.modelId.value] }
      }
      return nm
    })
    return { ...m, nestedModels }
  })

  const model = mandatory(
    allModels.find((m) => m.name.value === modelAndAllModels.model.name.value),
    'model',
  )
  return { model, allModels }
}

function convertPrimitiveArrayToObjectArray(
  key: string,
  items: JsonSchemaProperty,
): JsonSchemaProperty {
  if (items.type === 'string') {
    if (items.contentMediaType) {
      return {
        type: 'object',
        properties: {
          files: {
            type: 'string',
            contentEncoding: items.contentEncoding,
            contentMediaType: items.contentMediaType,
          },
        },
      }
    }
    return {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
    }
  }
  return {
    type: 'object',
    properties: {
      value: {
        type: items.type,
      },
    },
  }
}

function ensureNoPrimitiveArrays(
  properties: Record<string, JsonSchemaProperty>,
): Record<string, JsonSchemaProperty> {
  return Object.keys(properties).reduce((acc, key) => {
    const property = properties[key]
    if (property.type === 'array' && property.items) {
      if (Array.isArray(property.items)) {
        throw new Error(`Array property ${key} has multiple items defined`)
      }
      if (property.items.type === 'object') {
        return { ...acc, [key]: property }
      }
      return {
        ...acc,
        [key]: { ...property, items: convertPrimitiveArrayToObjectArray(key, property.items) },
      }
    }
    return { ...acc, [key]: property }
  }, {} as Record<string, JsonSchemaProperty>)
}

function convertPrimitiveArraysToObjectArrays(schema: JsonSchema): JsonSchema {
  return { ...schema, properties: ensureNoPrimitiveArrays(schema.properties) }
}

export function convertSchemaToModels(
  schema: JsonSchema,
  modelIdMap: { [key: string]: ModelId } = {},
): ModelAndAllModels {
  schema = convertPrimitiveArraysToObjectArrays(schema)
  const model = modelFns.newInstance(schema.title ?? 'Untitled')
  if (schema.pluralTitle) {
    model.pluralName = modelPluralNameFns.newInstance(schema.pluralTitle)
  }
  if ((schema as any).type === 'array') {
    schema = (schema as any).items
  }
  // return foldProperties(schema.properties, schema.required ?? [], { model, allModels: [model] })
  return reKeyModelIds(
    modelIdMap,
    foldProperties(schema.properties, schema.required ?? [], { model, allModels: [model] }),
  )
}

export function reconfigureApp(config: { model: Model; allModels: Model[] }) {
  const existingModels = get(modelStore).models.map((m) => m.model)
  const withConsistentIds = useSameSlotIds(existingModels, config.allModels)
  const model = modelFns.findById(withConsistentIds, config.model.id)
  config = { model, allModels: withConsistentIds }
  const eventSourcedModels = config.allModels.map((m) => eventSourcedModelFns.newInstance(m))
  modelStore.update(() => {
    return eventSourcedModelListFns.newInstance(eventSourcedModels)
  })
  navbarState.set(config.model.id.value)
  promptIndex.update((i) => i + 1)
}

export function existingModelIdMap(models: EventSourcedModel[]): { [key: string]: ModelId } {
  return models.reduce((acc, model) => {
    acc[model.model.name.value] = model.model.id
    return acc
  }, {} as { [key: string]: ModelId })
}

export function looksLikeJsonSchema(json: any) {
  const looksOk = json && json.title && json.type && json.properties
  return looksOk ? null : justErrorMessage('Not a valid JSON Schema')
}
