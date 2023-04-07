import { describe, expect, test } from 'vitest'
import { dataRecordFns } from '../../src'
import {
  addressModel,
  customerModel,
  invoiceLineItemsRelationship,
  invoiceModel,
  invoiceModels,
  lineItemModel,
} from '../../src/invoiceModel'
import {
  dataRecordAndPathFns,
  nestedRecordArrayPathElement,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { registerStringProperty } from '@cozemble/model-string-core'

registerStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('model with one has one relationship', () => {
  const address = dataRecordFns.random(systemConfig, invoiceModels, addressModel)
  const customer = dataRecordFns.random(systemConfig, invoiceModels, customerModel)
  const addressRelationship = customerModel.nestedModels[0]

  test('childRecords is empty if no record is there', () => {
    const childRecords = dataRecordFns.childRecords(invoiceModels, customer)
    expect(childRecords).toEqual([])
  })

  test('childRecords is returns the record and path if its there', () => {
    const customerWithAddress = { ...customer, values: { [addressRelationship.id.value]: address } }
    const childRecords = dataRecordFns.childRecords(invoiceModels, customerWithAddress)
    expect(childRecords).toEqual([dataRecordAndPathFns.newInstance(address, [addressRelationship])])
  })
})

describe('model with nested has one relationship', () => {
  const address = dataRecordFns.random(systemConfig, invoiceModels, addressModel)
  const customer = dataRecordFns.random(systemConfig, invoiceModels, customerModel)
  const invoice = dataRecordFns.random(systemConfig, invoiceModels, invoiceModel)
  const addressRelationship = customerModel.nestedModels[0]
  const customerRelationship = invoiceModel.nestedModels[0]

  test('childRecords is empty if no record is there', () => {
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoice)
    expect(childRecords).toEqual([])
  })

  test('childRecords is empty is the first node is there but the second is not', () => {
    const invoiceWithCustomer = {
      ...invoice,
      values: { [customerRelationship.id.value]: customer },
    }
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoiceWithCustomer)
    expect(childRecords).toEqual([
      dataRecordAndPathFns.newInstance(customer, [customerRelationship]),
    ])
  })

  test('childRecords is returns the record and path if its there', () => {
    const customerWithAddress = { ...customer, values: { [addressRelationship.id.value]: address } }
    const invoiceWithCustomer = {
      ...invoice,
      values: { [customerRelationship.id.value]: customerWithAddress },
    }
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoiceWithCustomer)
    expect(childRecords).toEqual([
      dataRecordAndPathFns.newInstance(customerWithAddress, [customerRelationship]),
      dataRecordAndPathFns.newInstance(address, [customerRelationship, addressRelationship]),
    ])
  })
})

describe('model with one has many relationship', () => {
  const lineItem1 = dataRecordFns.random(systemConfig, invoiceModels, lineItemModel)
  const lineItem2 = dataRecordFns.random(systemConfig, invoiceModels, lineItemModel)
  const invoice = dataRecordFns.random(systemConfig, invoiceModels, invoiceModel)

  test('childRecords is empty if no record is there', () => {
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoice)
    expect(childRecords).toEqual([])
  })

  test('childRecords is empty if the relationship array is empty', () => {
    const invoiceWithNoLineItems = {
      ...invoice,
      values: { [invoiceLineItemsRelationship.id.value]: [] },
    }
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoiceWithNoLineItems)
    expect(childRecords).toEqual([])
  })

  test('childRecords returns all from a single child array', () => {
    const invoiceWithOneLineItem1 = {
      ...invoice,
      values: { [invoiceLineItemsRelationship.id.value]: [lineItem1] },
    }
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoiceWithOneLineItem1)
    expect(childRecords).toEqual([
      dataRecordAndPathFns.newInstance(lineItem1, [
        nestedRecordArrayPathElement(invoiceLineItemsRelationship, 0),
      ]),
    ])
  })

  test('childRecords returns all from a double child array', () => {
    const invoiceWithOneLineItem1 = {
      ...invoice,
      values: { [invoiceLineItemsRelationship.id.value]: [lineItem1, lineItem2] },
    }
    const childRecords = dataRecordFns.childRecords(invoiceModels, invoiceWithOneLineItem1)
    expect(childRecords).toEqual([
      dataRecordAndPathFns.newInstance(lineItem1, [
        nestedRecordArrayPathElement(invoiceLineItemsRelationship, 0),
      ]),
      dataRecordAndPathFns.newInstance(lineItem2, [
        nestedRecordArrayPathElement(invoiceLineItemsRelationship, 1),
      ]),
    ])
  })
})
