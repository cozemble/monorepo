import { expect, test } from 'vitest'
import { customerSchema, invoiceSchema, schemaWithImage } from './sampleSchemas'
import { convertSchemaToModels } from '../src/lib/generative/components/helpers'
import { registerJsonProperties } from '@cozemble/model-properties-core'
import { objects } from '@cozemble/lang-util'
import { convertModelToJsonSchema } from '../src/lib/convertModelToJsonSchema'
import { registerAttachmentProperty } from '@cozemble/model-attachment-core'

registerJsonProperties()
registerAttachmentProperty()

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

test('can round trip a schema with an image', () => {
  const { model, allModels } = convertSchemaToModels(schemaWithImage)
  const jsonSchema = convertModelToJsonSchema(model, allModels)
  expect(jsonSchema.properties['logo']).toBeDefined()
  expect(jsonSchema.properties['logo'].contentEncoding).toBe('base64')
  expect(jsonSchema.properties['logo'].contentMediaType).toBe('image/*')
})
