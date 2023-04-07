import { expect, test } from 'vitest'
import { dataRecordFns, dataRecordPathElementFns } from '../../src'
import { addressModel, customerModel, invoiceModel, invoiceModels } from '../../src/invoiceModel'
import { registerStringProperty } from '@cozemble/model-string-core'
import { systemConfigurationFns } from '@cozemble/model-core'

registerStringProperty()
const systemConfig = systemConfigurationFns.empty()

const customerRelationship = invoiceModel.nestedModels[0]
const addressRelationship = customerModel.nestedModels[0]

test('returns the given record if the child path is empty', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'test-user')
  expect(dataRecordPathElementFns.getNestedRecord(invoiceModels, invoiceRecord, [])).toEqual(
    invoiceRecord,
  )
})

test('returns the child record at one level of depth', () => {
  const customerRecord = dataRecordFns.random(systemConfig, invoiceModels, customerModel)
  const invoiceRecord = dataRecordFns.random(systemConfig, invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })
  expect(
    dataRecordPathElementFns.getNestedRecord(invoiceModels, invoiceRecord, [customerRelationship]),
  ).toEqual(customerRecord)
})

test('returns null if value missing, at one level of depth', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'test-user')
  const customerPathElement = invoiceModel.nestedModels[0]
  expect(
    dataRecordPathElementFns.getNestedRecord(invoiceModels, invoiceRecord, [customerPathElement]),
  ).toBeNull()
})

test('returns the child record at two levels of depth', () => {
  const addressRecord = dataRecordFns.random(systemConfig, invoiceModels, addressModel)
  const customerRecord = dataRecordFns.random(systemConfig, invoiceModels, customerModel, {
    Address: addressRecord,
  })
  const invoiceRecord = dataRecordFns.random(systemConfig, invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })
  expect(
    dataRecordPathElementFns.getNestedRecord(invoiceModels, invoiceRecord, [
      customerRelationship,
      addressRelationship,
    ]),
  ).toEqual(addressRecord)
})

test('returns null if value missing at one level of depth for a two level path', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'test-user')
  expect(
    dataRecordPathElementFns.getNestedRecord(invoiceModels, invoiceRecord, [
      customerRelationship,
      addressRelationship,
    ]),
  ).toBeNull()
})

test('returns null if value missing at second level of depth for a two level path', () => {
  const customerRecord = dataRecordFns.newInstance(customerModel, 'test-user')
  const invoiceRecord = dataRecordFns.random(systemConfig, invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })
  expect(
    dataRecordPathElementFns.getNestedRecord(invoiceModels, invoiceRecord, [
      customerRelationship,
      addressRelationship,
    ]),
  ).toBeNull()
})
