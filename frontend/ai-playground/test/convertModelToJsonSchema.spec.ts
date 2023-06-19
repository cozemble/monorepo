import { expect, test } from 'vitest'
import { customerSchema, invoiceSchema } from './sampleSchemas'
import { convertSchemaToModels } from '../src/lib/generative/components/helpers'
import { registerJsonProperties } from '@cozemble/model-properties-core'
import { objects } from '@cozemble/lang-util'
import { convertModelToJsonSchema } from '../src/lib/convertModelToJsonSchema'

registerJsonProperties()

test('can round trip a simple customer schema', () => {
  const { model, allModels } = convertSchemaToModels(customerSchema)
  const jsonSchema = convertModelToJsonSchema(model, allModels)
  expect(objects.dropKeys(jsonSchema, '$id')).toEqual(objects.dropKeys(customerSchema, '$id'))
})

test('can round trip a simple invoice schema', () => {
  const { model, allModels } = convertSchemaToModels(invoiceSchema)
  const jsonSchema = convertModelToJsonSchema(model, allModels)
  expect(objects.dropKeys(jsonSchema, '$id')).toEqual(objects.dropKeys(invoiceSchema, '$id'))
})
