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
  emptyModel,
  modelNameFns,
  propertyDescriptors,
  propertyIdFns,
  type DataRecordPath,
  type ModelPath,
  type ModelPathElement,
  type Relationship,
} from '@cozemble/model-core'
import { clock, mandatory, options, strings } from '@cozemble/lang-util'
import { propertyFns } from './propertyFns'
import { relationshipFns } from './relationshipFns'
import { modelPathFns } from './modelPathFns'
import {
  ManyCardinalityValuesForModelPath,
  SingleCardinalityValuesForModelPath,
  singleCardinalityValuesForModelPathResponse,
} from './valuesForModelPath'

export const modelOptions = {
  withProperty(p: Property | string): ModelOption {
    if (typeof p === 'string') {
      p = propertyFns.newInstance(p)
    }
    return this.withProperties(p)
  },
  withProperties(...ps: Property[]): ModelOption {
    return (model) => ({ ...model, properties: [...model.properties, ...ps] })
  },
  withRelationships(...rs: Relationship[]): ModelOption {
    return (model) => ({ ...model, relationships: [...model.relationships, ...rs] })
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
      model.properties.find((p) => propertyIdFns.equals(p.id, propertyId)),
      `Property not found: ${propertyId.value}`,
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
  addRelationship(
    cardinality: Cardinality,
    modelName: string,
    relationshipName: string,
    model: Model,
  ): { model: Model; relatedModel: Model } {
    const relatedModel = modelFns.newInstance(modelName, modelOptions.withParentModelId(model.id))
    model = {
      ...model,
      relationships: [
        ...model.relationships,
        relationshipFns.newInstance(relationshipName, relatedModel.id, cardinality),
      ],
    }
    return { model, relatedModel }
  },
  addProperty(model: Model, ...propertyOpts: PropertyOption[]): Model {
    const property = propertyFns.newInstance('Untitled Property', ...propertyOpts)
    return {
      ...model,
      properties: [...model.properties, property],
    }
  },
  allPaths(models: Model[], model: Model): ModelPath<ModelPathElement>[] {
    const propertyPaths = model.properties.map((p) => modelPathFns.newInstance(p))
    const relationshipPaths = model.relationships.flatMap((r) => {
      return modelFns
        .allPaths(models, modelFns.findById(models, r.modelId))
        .map((p) => modelPathFns.prefix(r, p))
    })
    return [...propertyPaths, ...relationshipPaths]
  },
  elementByName(model: Model, name: string): ModelPathElement {
    return mandatory(
      model.properties.find((p) => p.name.value === name) ||
        model.properties.find((p) => strings.camelize(p.name.value) === name) ||
        model.relationships.find((r) => r.name.value === name) ||
        model.relationships.find((r) => strings.camelize(r.name.value) === name),
      `Model element not found, name = ${name}, model = ${model.name.value}`,
    )
  },
  maybeElementById(model: Model, id: string): ModelPathElement | null {
    return (
      model.properties.find((p) => p.id.value === id) ||
      model.relationships.find((r) => r.id.value === id) ||
      null
    )
  },
  elementById(model: Model, id: string): ModelPathElement {
    return mandatory(
      model.properties.find((p) => p.id.value === id) ||
        model.relationships.find((r) => r.id.value === id),
      `Model element not found, id = ${name}, model = ${model.name.value}`,
    )
  },
  elementsByName(models: Model[], model: Model, names: string[]): ModelPathElement[] {
    return names.reduce((elements, name) => {
      const element = modelFns.elementByName(model, name)
      if (element._type === 'relationship') {
        model = modelFns.findById(models, element.modelId)
      }
      return [...elements, element]
    }, [] as ModelPathElement[])
  },
  elementsById(models: Model[], model: Model, ids: string[]): ModelPathElement[] {
    return ids.reduce((elements, id) => {
      const element = modelFns.elementById(model, id)
      if (element._type === 'relationship') {
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
}
