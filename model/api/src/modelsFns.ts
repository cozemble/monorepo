import type {
  Cardinality,
  DataRecord,
  Model,
  ModelId,
  ModelOption,
  Property,
  PropertyId,
  PropertyOption,
} from '@cozemble/model-core'
import {
  type DataRecordValuePath,
  emptyModel,
  LeafModelSlot,
  ModelName,
  modelNameFns,
  type ModelPath,
  type ModelPathElement,
  ModelPluralName,
  modelPluralNameFns,
  ModelSlot,
  ModelSlotId,
  type NestedModel,
  propertyDescriptors,
  SystemConfiguration,
} from '@cozemble/model-core'
import { clock, errors, mandatory, options, strings } from '@cozemble/lang-util'
import { propertyFns } from './propertyFns.js'
import { modelPathFns } from './modelPathFns.js'
import {
  ManyCardinalityValuesForModelPath,
  SingleCardinalityValuesForModelPath,
  singleCardinalityValuesForModelPathResponse,
} from './valuesForModelPath.js'
import { nestedModelFns } from './nestedModelFns.js'

export const modelOptions = {
  withSingularName(givenName: string | ModelName): ModelOption {
    const name = typeof givenName === 'string' ? modelNameFns.newInstance(givenName) : givenName
    return (model: any) => ({ ...model, name })
  },
  withPluralName(givenName: string | ModelPluralName): ModelOption {
    const pluralName =
      typeof givenName === 'string' ? modelPluralNameFns.newInstance(givenName) : givenName
    return (model: any) => ({ ...model, pluralName })
  },
  withId(id: ModelId): ModelOption {
    return (model: any) => ({ ...model, id })
  },
  withProperty(p: Property | string): ModelOption {
    if (typeof p === 'string') {
      p = propertyFns.newInstance(p)
    }
    return this.withProperties(p)
  },
  withSlot(slot: ModelSlot): ModelOption {
    return (model: any) => ({ ...model, slots: [...model.slots, slot] })
  },
  withProperties(...ps: Property[]): ModelOption {
    return (model: any) => ({ ...model, slots: [...model.slots, ...ps] })
  },
  withNestedModels(...ns: NestedModel[]): ModelOption {
    return (model: any) => ({ ...model, nestedModels: [...model.nestedModels, ...ns] })
  },
  withParentModelId(parentModelId: ModelId): ModelOption {
    return (model: any) => ({ ...model, parentModelId })
  },
}

function validateValues(
  systemConfiguration: SystemConfiguration,
  path: ModelPath<Property>,
  value: SingleCardinalityValuesForModelPath | ManyCardinalityValuesForModelPath,
  errors: Map<DataRecordValuePath, string[]>,
) {
  if (value._type === 'single.cardinality.values.for.model.path.response') {
    const property = path.lastElement
    const propertyDescriptor = propertyDescriptors.mandatory(property)
    const propertyErrors = propertyDescriptor.validateValue(
      systemConfiguration,
      property,
      value.value.value,
    )
    if (propertyErrors.length > 0) {
      errors.set(value.value.path, propertyErrors)
    }
  } else {
    value.value.forEach((v) => {
      validateValues(
        systemConfiguration,
        path,
        singleCardinalityValuesForModelPathResponse(v),
        errors,
      )
    })
  }
}

export const modelFns = {
  newInstance: (name: string, ...opts: ModelOption[]): Model => {
    return options.apply(emptyModel(modelNameFns.newInstance(name)), ...opts)
  },
  findById(models: Model[], modelId: ModelId): Model {
    return mandatory(
      models.find((m) => m.id.value === modelId.value),
      `Model not found: ${modelId.value}`,
    )
  },
  propertyWithId(model: Model, propertyId: PropertyId): Property {
    return mandatory(
      model.slots.find(
        (p) => p.id.value === propertyId.value && p._type === 'property',
      ) as Property,
      `Property not found: ${propertyId.value}`,
    )
  },
  maybePropertyWithId(model: Model, propertyId: PropertyId | null): Property | null {
    if (propertyId === null) {
      return null
    }
    return mandatory(
      model.slots.find(
        (p) => p.id.value === propertyId.value && p._type === 'property',
      ) as Property,
      `Property not found: ${propertyId.value}`,
    )
  },
  maybeSlotWithId(model: Model, slotId: ModelSlotId | null): ModelSlot | null {
    if (slotId === null) {
      return null
    }
    return mandatory(
      model.slots.find((slot) => slot.id.value === slotId.value),
      `Model slot not found: ${slotId.value}`,
    )
  },
  setPropertyValue(
    systemConfiguration: SystemConfiguration,
    model: Model,
    property: Property,
    value: any | null,
    record: DataRecord,
  ): DataRecord {
    return {
      ...propertyDescriptors
        .mandatory(property)
        .setValue(systemConfiguration, property, record, value),
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
    }
  },
  addNestedModelRelationship(
    cardinality: Cardinality,
    modelName: string,
    nestedName: string,
    model: Model,
  ): { model: Model; relatedModel: Model } {
    const relatedModel = modelFns.newInstance(modelName, modelOptions.withParentModelId(model.id))
    model = {
      ...model,
      nestedModels: [
        ...model.nestedModels,
        nestedModelFns.newInstance(nestedName, relatedModel.id, cardinality),
      ],
    }
    return { model, relatedModel }
  },
  addProperty(model: Model, ...propertyOpts: PropertyOption[]): Model {
    const property = propertyFns.newInstance('Untitled Property', ...propertyOpts)
    return {
      ...model,
      slots: [...model.slots, property],
    }
  },
  applyOptions(model: Model, ...opts: ModelOption[]): Model {
    return options.apply(model, ...opts)
  },
  allPaths(models: Model[], model: Model): ModelPath<ModelPathElement>[] {
    const slotPaths = model.slots.map((p) => modelPathFns.newInstance(p))
    const nestedModelPaths = model.nestedModels.flatMap((nestedModel) => {
      return modelFns
        .allPaths(models, modelFns.findById(models, nestedModel.modelId))
        .map((path) => modelPathFns.prefix(nestedModel, path))
    })
    return [...slotPaths, ...nestedModelPaths]
  },
  elementByName(model: Model, name: string): ModelPathElement {
    const matches = [
      ...model.slots.filter((p) => p.name.value === name),
      ...model.slots.filter((p) => strings.camelize(p.name.value) === name),
      ...model.nestedModels.filter((r) => r.name.value === name),
      ...model.nestedModels.filter((r) => strings.camelize(r.name.value) === name),
    ]
    if (matches.length > 1) {
      throw new Error(`Multiple model elements found with name = ${name}`)
    }
    if (matches.length === 0) {
      throw new Error(`No model elements found with name '${name}' in model ${model.name.value}`)
    }
    return matches[0]
  },
  maybeElementById(model: Model, id: string): ModelPathElement | null {
    return (
      model.slots.find((p) => p.id.value === id) ||
      model.nestedModels.find((r) => r.id.value === id) ||
      null
    )
  },
  elementById(model: Model, id: string): ModelPathElement {
    return mandatory(
      model.slots.find((p) => p.id.value === id) ||
        model.nestedModels.find((r) => r.id.value === id),
      `Model element not found, id = ${id}, model = ${model.name.value}`,
    )
  },
  elementsByName(models: Model[], model: Model, names: string[]): ModelPathElement[] {
    return names.reduce((elements, name) => {
      const element = modelFns.elementByName(model, name)
      if (element._type === 'nested.model') {
        model = modelFns.findById(models, element.modelId)
      }
      return [...elements, element]
    }, [] as ModelPathElement[])
  },
  elementsById(models: Model[], model: Model, ids: string[]): ModelPathElement[] {
    return ids.reduce((elements, id) => {
      const element = modelFns.elementById(model, id)
      if (element._type === 'nested.model') {
        model = modelFns.findById(models, element.modelId)
      }
      return [...elements, element]
    }, [] as ModelPathElement[])
  },
  validate(
    systemConfiguration: SystemConfiguration,
    models: Model[],
    record: DataRecord,
  ): Map<DataRecordValuePath, string[]> {
    const model = modelFns.findById(models, record.modelId)
    const pathsToProperties: ModelPath<Property>[] = modelFns
      .allPaths(models, model)
      .filter((p) => modelPathFns.isPathToProperty(p)) as ModelPath<Property>[]
    try {
      return pathsToProperties.reduce((errors, path) => {
        const value = modelPathFns.getValues(systemConfiguration, models, path, record)
        validateValues(systemConfiguration, path, value, errors)
        return errors
      }, new Map<DataRecordValuePath, string[]>())
    } catch (e) {
      throw errors.prependToMessage(e, `Error validating record: ${record.id.value}`)
    }
  },
  properties(model: Model): Property[] {
    return model.slots.filter((p) => p._type === 'property') as Property[]
  },
  findInboundReferences(models: Model[], model: Model): Model[] {
    return models.filter((m) => {
      const paths = modelFns.allPaths(models, m)
      return paths.some((p) => {
        if (p.lastElement._type === 'model.reference') {
          return p.lastElement.referencedModelIds.some((id) => id.value === model.id.value)
        }
        return false
      })
    })
  },
  allPathsReferencingModel(
    models: Model[],
    sourceModel: Model,
    targetModelId: ModelId,
  ): ModelPath<ModelPathElement>[] {
    const allPaths = modelFns.allPaths(models, sourceModel)
    return allPaths.filter((path) => {
      const lastElement = path.lastElement
      return (
        lastElement._type === 'model.reference' &&
        lastElement.referencedModelIds.some((m) => m.value === targetModelId.value)
      )
    })
  },
  pathsToUniqueProperties(models: Model[], model: Model): ModelPath<Property>[] {
    return modelFns.allPaths(models, model).filter((path) => {
      return path.lastElement._type === 'property' && path.lastElement.unique
    }) as ModelPath<Property>[]
  },
  leafSlots(model: Model): LeafModelSlot[] {
    return model.slots.filter(
      (s) => s._type === 'property' || s._type === 'model.reference',
    ) as LeafModelSlot[]
  },
}
