import uppercamelcase from 'uppercamelcase'
import * as path from 'path'
import _ from 'lodash'

import { Model, ModelName, Property, PropertyType, RelationshipName } from '@cozemble/model-core'
import { GraphQLScalarType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean } from 'graphql'

export function modelToJsonSchema(rootModel: Model, models: Model[]): any {
  return parser(rootModel, models)
}

type TypeDefinition = {
  type: string
  pattern?: string
  description?: string
}

type PropertyDefinition = {
  [key: string]: TypeDefinition | Schema
}

type Schema = {
  ref: string
  type: string
  properties: PropertyDefinition
  required: string[]
  relations?: string[]
}

type Validation = {
  regex: string
  message: string
  _type: 'regex.validation'
}

interface IProperty extends Property {
  validations: Validation[]
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
  const { name, properties, relationships } = model
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
    if (property.required) {
      result.required.push(key)
    }
  }

  result.relations = relationships.map(({ name }) => {
    return getRelationName(name)
  })

  return result
}

function buildModelTypes({ propertyType, validations }: IProperty): TypeDefinition {
  const resp = {
    type: getPropertyType(propertyType) as string,
    // description: buildDescription({ title: name.value }),
  }

  if (validations?.length) {
    Object.assign(resp, { pattern: validations[0].regex })
  }

  return resp
}

type ScalarType = 'boolean' | 'integer' | 'number' | 'string'

const getModelName = ({ value }: ModelName) => {
  if (typeof value === 'undefined') return ''
  return uppercamelcase(path.parse(value).name)
}

const getRelationName = ({ value }: RelationshipName) => {
  if (typeof value === 'undefined') return ''
  return uppercamelcase(path.parse(value).name)
}

const getPropertyType = ({ value }: PropertyType) => {
  const types = Object.keys(scalarTypes)
  const propType = value.split('.')[0]

  if (!types.includes(propType)) return undefined
  return propType
}

const scalarTypes: Record<ScalarType, GraphQLScalarType> = {
  string: GraphQLString,
  integer: GraphQLInt,
  number: GraphQLFloat,
  boolean: GraphQLBoolean,
}
