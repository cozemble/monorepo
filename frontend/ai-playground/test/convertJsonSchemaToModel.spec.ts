import { expect, test } from 'vitest'
import { modelIdFns, Property } from '@cozemble/model-core'
import { convertSchemaToModels } from '../src/lib/generative/components/helpers'
import { registerJsonProperties } from '@cozemble/model-properties-core'
import { mandatory } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'
import {
  actualInvoiceSchema1,
  amendedCustomerSchema,
  customerAsArray,
  customerSchema,
  invoiceSchema,
} from './sampleSchemas'

registerJsonProperties()

test('can convert customer response', () => {
  const { model, allModels } = convertSchemaToModels(customerSchema)
  expect(model.slots.map((slot) => slot.name.value)).toEqual([
    'Id',
    'First Name',
    'Last Name',
    'Email',
    'Phone Number',
  ])
  expect((model.slots[0] as Property).required).toBe(true)
  expect((model.slots[0] as Property).unique).toBe(true)
  expect((model.slots[4] as Property).propertyType.value).toBe('json.phoneNumber.property')
  expect(model.nestedModels).toHaveLength(1)
  expect(allModels.length).toBe(2)
  const addressModel = mandatory(
    allModels.find((model) => model.name.value === 'Address'),
    `Address model not found`,
  )
  expect(model.nestedModels[0].modelId.value).toBe(addressModel.id.value)
  expect(model.nestedModels[0].cardinality).toBe('one')
  expect(addressModel.slots.map((slot) => slot.name.value)).toEqual([
    'Street',
    'City',
    'State',
    'Zip Code',
  ])
  expect((addressModel.slots[0] as Property).required).toBe(true)
  expect(allModels.includes(model)).toBe(true)
})

test('can control the model ids when converting a schema', () => {
  const { model, allModels } = convertSchemaToModels(customerSchema, {
    Customer: modelIdFns.newInstance('customer-model'),
    Address: modelIdFns.newInstance('address-model'),
  })
  const [customerModel, addressModel] = allModels
  expect(customerModel.id.value).toBe('customer-model')
  expect(addressModel.id.value).toBe('address-model')
  expect(customerModel.nestedModels[0].modelId.value).toBe('address-model')
  expect(allModels.includes(model)).toBe(true)
})

test('can handle arrays', () => {
  const { model, allModels } = convertSchemaToModels(invoiceSchema)
  expect(model.slots.map((slot) => slot.name.value)).toEqual([
    'Invoice Id',
    'Billing Date',
    'Due Date',
    'Billing Company',
    'Customer Name',
    'Total Amount',
  ])
  expect(model.nestedModels).toHaveLength(1)
  expect(model.nestedModels[0].cardinality).toBe('many')

  const itemsModel = modelFns.findById(allModels, model.nestedModels[0].modelId)
  expect(itemsModel.slots.map((slot) => slot.name.value)).toEqual([
    'Description',
    'Quantity',
    'Price',
  ])
  expect((itemsModel.slots[0] as Property).required).toBe(true)
  expect(allModels.includes(model)).toBe(true)
})

test("can handle schema with 'actual' schema", () => {
  const { allModels } = convertSchemaToModels(actualInvoiceSchema1)
  expect(allModels).toHaveLength(2)
  const [_, lineItemModel] = allModels
  expect(lineItemModel.slots.map((slot) => slot.name.value)).toEqual(['Item', 'Quantity', 'Price'])
})

test("if the root model is an array, use the first item's schema", () => {
  const { model, allModels } = convertSchemaToModels(customerAsArray as any)
  expect(model.slots.map((slot) => slot.name.value)).toEqual([
    'Id',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
  ])
})

test('an amended customer whose address did not get added as a nested model', () => {
  const { model, allModels } = convertSchemaToModels(amendedCustomerSchema)
  expect(model.nestedModels).toHaveLength(1)
})
