import _ from 'lodash'

import { Model } from '@cozemble/model-core'
import { buildModelTypes, getModelName, getRelationName } from './lib'
import { IProperty, Schema } from './types/schema'
import { modelFns } from '@cozemble/model-api'

export function modelToJsonSchema(rootModel: Model, models: Model[]): Schema {
  return parser(rootModel, models)
}

function parser(rootModel: Model, models: Model[]) {
  //TODO: validate models
  const root = parseModel(rootModel)
  const payload = models.map((model: Model) => parseModel(model))

  const relation = root.relations?.length ? root.relations[0] : undefined
  if (typeof relation !== 'undefined') {
    const relationObject = payload
      .filter(({ ref }) => Object.is(ref, relation))
      .map(({ type, properties, required }) => ({ type, properties, required }))[0]

    Object.assign(root.properties, { [relation]: relationObject })
  }

  delete root.relations
  return root
}

function parseModel(model: Model) {
  const { name, nestedModels } = model
  const properties = modelFns.properties(model)
  if (_.isUndefined(name)) throw new Error('Schema does not have an `name` property.')
  const modelName = getModelName(name)

  const result: Schema = {
    ref: modelName,
    type: 'object',
    properties: {},
    required: [],
    relations: [],
  }

  for (const property of properties) {
    const key = property.name.value

    result.properties[key] = buildModelTypes(property as IProperty)
    if (property._type === 'property' && property.required) {
      result.required.push(key)
    }
  }

  result.relations = nestedModels.map(({ name }) => {
    return getRelationName(name)
  })

  return result
}
