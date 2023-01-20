import { expect, test } from 'vitest'
import { dataRecordFns, dataRecordPathElementFns } from '../../src'
import { addressModel, customerModel, invoiceModel, invoiceModels } from '../../src/invoiceModel'
import type { HasOneRelationship } from '@cozemble/model-core'
import { registerStringProperty } from '@cozemble/model-string-core'

registerStringProperty()

const customerRelationship = invoiceModel.relationships[0] as HasOneRelationship
const addressRelationship = customerModel.relationships[0] as HasOneRelationship

test('returns the given record if the child path is empty', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'test-user')
  expect(dataRecordPathElementFns.getChildRecord(invoiceModels, invoiceRecord, [])).toEqual(
    invoiceRecord,
  )
})

test('returns the child record at one level of depth', () => {
  const customerRecord = dataRecordFns.random(invoiceModels, customerModel)
  const invoiceRecord = dataRecordFns.random(invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })
  expect(
    dataRecordPathElementFns.getChildRecord(invoiceModels, invoiceRecord, [customerRelationship]),
  ).toEqual(customerRecord)
})

test('returns null if value missing, at one level of depth', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'test-user')
  const customerPathElement = invoiceModel.relationships[0] as HasOneRelationship
  expect(
    dataRecordPathElementFns.getChildRecord(invoiceModels, invoiceRecord, [customerPathElement]),
  ).toBeNull()
})

test('returns the child record at two levels of depth', () => {
  const addressRecord = dataRecordFns.random(invoiceModels, addressModel)
  const customerRecord = dataRecordFns.random(invoiceModels, customerModel, {
    Address: addressRecord,
  })
  const invoiceRecord = dataRecordFns.random(invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })
  expect(
    dataRecordPathElementFns.getChildRecord(invoiceModels, invoiceRecord, [
      customerRelationship,
      addressRelationship,
    ]),
  ).toEqual(addressRecord)
})

test('returns null if value missing at one level of depth for a two level path', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'test-user')
  expect(
    dataRecordPathElementFns.getChildRecord(invoiceModels, invoiceRecord, [
      customerRelationship,
      addressRelationship,
    ]),
  ).toBeNull()
})

test('returns null if value missing at second level of depth for a two level path', () => {
  const customerRecord = dataRecordFns.newInstance(customerModel, 'test-user')
  const invoiceRecord = dataRecordFns.random(invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })
  expect(
    dataRecordPathElementFns.getChildRecord(invoiceModels, invoiceRecord, [
      customerRelationship,
      addressRelationship,
    ]),
  ).toBeNull()
})
