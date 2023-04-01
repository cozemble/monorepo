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
  type DataRecordPath,
  emptyModel,
  modelNameFns,
  type ModelPath,
  type ModelPathElement,
  ModelReference,
  ModelSlot,
  ModelSlotId,
  type NestedModel,
  propertyDescriptors,
} from '@cozemble/model-core'
import { clock, mandatory, options, strings } from '@cozemble/lang-util'
import { propertyFns } from './propertyFns'
import { modelPathFns } from './modelPathFns'
import {
  ManyCardinalityValuesForModelPath,
  SingleCardinalityValuesForModelPath,
  singleCardinalityValuesForModelPathResponse,
} from './valuesForModelPath'
import { nestedModelFns } from './nestedModelFns'

export const modelOptions = {
  withProperty(p: Property | string): ModelOption {
    if (typeof p === 'string') {
      p = propertyFns.newInstance(p)
    }
    return this.withProperties(p)
  },
  withSlot(slot: ModelSlot): ModelOption {
    return (model) => ({ ...model, slots: [...model.slots, slot] })
  },
  withProperties(...ps: Property[]): ModelOption {
    return (model) => ({ ...model, slots: [...model.slots, ...ps] })
  },
  withNestedModels(...ns: NestedModel[]): ModelOption {
    return (model) => ({ ...model, nestedModels: [...model.nestedModels, ...ns] })
  },
  withParentModelId(parentModelId: ModelId): ModelOption {
    return (model) => ({ ...model, parentModelId })
  },
}

function validateValues(
  path: ModelPath<Property>,
  value: SingleCardinalityValuesForModelPath | ManyCardinalityValuesForModelPath,
  errors: Map<DataRecordPath, string[]>,
) {
  if (value._type === 'single.cardinality.values.for.model.path.response') {
    const property = path.lastElement
    const propertyDescriptor = propertyDescriptors.mandatory(property)
    const propertyErrors = propertyDescriptor.validateValue(property, value.value.value)
    if (propertyErrors.length > 0) {
      errors.set(value.value.path, propertyErrors)
    }
  } else {
    value.value.forEach((v) => {
      validateValues(path, singleCardinalityValuesForModelPathResponse(v), errors)
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
    model: Model,
    property: Property,
    value: any | null,
    record: DataRecord,
  ): DataRecord {
    return {
      ...propertyDescriptors.mandatory(property).setValue(property, record, value),
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
  allPaths(models: Model[], model: Model): ModelPath<ModelPathElement>[] {
    const propertyPaths = model.slots.map((p) => modelPathFns.newInstance(p))
    const nestedModelPaths = model.nestedModels.flatMap((r) => {
      return modelFns
        .allPaths(models, modelFns.findById(models, r.modelId))
        .map((p) => modelPathFns.prefix(r, p))
    })
    return [...propertyPaths, ...nestedModelPaths]
  },
  elementByName(model: Model, name: string): ModelPathElement {
    return mandatory(
      model.slots.find((p) => p.name.value === name) ||
        model.slots.find((p) => strings.camelize(p.name.value) === name) ||
        model.nestedModels.find((r) => r.name.value === name) ||
        model.nestedModels.find((r) => strings.camelize(r.name.value) === name),
      `Model element not found, name = ${name}, model = ${model.name.value}`,
    )
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
      `Model element not found, id = ${name}, model = ${model.name.value}`,
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
  validate(models: Model[], record: DataRecord): Map<DataRecordPath, string[]> {
    const model = modelFns.findById(models, record.modelId)
    const pathsToProperties: ModelPath<Property>[] = modelFns
      .allPaths(models, model)
      .filter((p) => modelPathFns.isPathToProperty(p)) as ModelPath<Property>[]
    return pathsToProperties.reduce((errors, path) => {
      const value = modelPathFns.getValues(models, path, record)
      validateValues(path, value, errors)
      return errors
    }, new Map<DataRecordPath, string[]>())
  },
  properties(model: Model): Property[] {
    return model.slots.filter((p) => p._type === 'property') as Property[]
  },
}
