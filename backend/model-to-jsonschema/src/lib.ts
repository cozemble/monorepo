import uppercamelcase from 'uppercamelcase'
import * as path from 'path'

import { ModelName, PropertyType, NestedModelName } from '@cozemble/model-core'
import { IProperty, TypeDefinition, scalarTypes } from './types/schema.js'

function buildModelTypes({ propertyType, validations }: IProperty): TypeDefinition {
  const resp = { type: getPropertyType(propertyType) as string }

  if (validations?.length) {
    Object.assign(resp, { pattern: validations[0].regex })
  }

  return resp
}

function getModelName({ value }: ModelName) {
  if (typeof value === 'undefined') return ''
  return uppercamelcase(path.parse(value).name)
}

function getRelationName({ value }: NestedModelName) {
  if (typeof value === 'undefined') return ''
  return uppercamelcase(path.parse(value).name)
}

function getPropertyType({ value }: PropertyType) {
  const types = Object.keys(scalarTypes)
  const propType = value.split('.')[0]

  if (!types.includes(propType)) return undefined
  return propType
}

export { getModelName, getRelationName, getPropertyType, buildModelTypes }
