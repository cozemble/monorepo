import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import { dataRecordFns, modelFns } from '@cozemble/model-api'
import {
  modelReferenceFns,
  modelReferenceNameFns,
  recordGraphEdgeFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import {
  getRecordById,
  getRecordsForModel,
  putModels,
  putRecord,
  simulateNewUser,
} from './testHelpers'
import { testEnv } from '../helper'
import { modelReferenceIdFns, tinyValueFns } from '@cozemble/model-core'

const jwtSigningSecret = 'secret'
const port = 3012
const systemConfig = systemConfigurationFns.empty()

describe('with a migrated database', () => {
  beforeAll(async () => {
    try {
      await appWithTestContainer(jwtSigningSecret, port)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test(`getting a record with no edges returns an empty edge array`, async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customers')],
      bearer,
    )
    const models = [customerModel]
    const customerRecord1 = dataRecordFns.random(systemConfig, models, customerModel)

    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)
    const fetchedById = await getRecordById(
      port,
      tenantId,
      customerModel.id,
      customerRecord1.id,
      bearer,
    )
    expect(fetchedById.edges).toHaveLength(0)
    expect(fetchedById.record).toEqual(customerRecord1)

    const allRecords = await getRecordsForModel(port, tenantId, customerModel.id, bearer)
    expect(allRecords.records).toEqual([customerRecord1])
    expect(allRecords.edges).toHaveLength(0)
  })

  test('can add one edge to a record and retrieve it', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel, bookingModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customers'), modelFns.newInstance('Bookings')],
      bearer,
    )
    const models = [customerModel, bookingModel]
    const customerRecord1 = dataRecordFns.random(systemConfig, models, customerModel)
    const bookingRecord1 = dataRecordFns.random(systemConfig, models, bookingModel)
    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)
    const booking1ToCustomer1 = recordGraphEdgeFns.newInstance(
      modelReferenceIdFns.newInstance(),
      bookingModel.id,
      customerModel.id,
      bookingRecord1.id,
      customerRecord1.id,
      tinyValueFns.id(),
    )
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord1, [booking1ToCustomer1])
    const fetchedBooking = await getRecordById(
      port,
      tenantId,
      bookingModel.id,
      bookingRecord1.id,
      bearer,
    )
    expect(fetchedBooking.record).toEqual(bookingRecord1)
    expect(fetchedBooking.edges).toEqual([booking1ToCustomer1])

    const allRecords = await getRecordsForModel(port, tenantId, customerModel.id, bearer)
    expect(allRecords.records).toEqual([customerRecord1])
    expect(allRecords.edges).toEqual([booking1ToCustomer1])
  })

  test('can post record edges and retrieve them', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel, bookingModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customers'), modelFns.newInstance('Bookings')],
      bearer,
    )
    const models = [customerModel, bookingModel]
    const customerRecord1 = dataRecordFns.random(systemConfig, models, customerModel)
    const bookingRecord1 = dataRecordFns.random(systemConfig, models, bookingModel)
    const bookingRecord2 = dataRecordFns.random(systemConfig, models, bookingModel)

    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord1)
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord2)
    const modelReference = modelReferenceFns.newInstance(
      customerModel.id,
      [bookingModel.id],
      modelReferenceNameFns.newInstance('Bookings'),
    )

    const customer1ToBooking1Edge = recordGraphEdgeFns.newInstance(
      modelReference.id,
      customerRecord1.modelId,
      bookingRecord1.modelId,
      customerRecord1.id,
      bookingRecord1.id,
    )
    const customer1ToBooking2Edge = recordGraphEdgeFns.newInstance(
      modelReference.id,
      customerRecord1.modelId,
      bookingRecord2.modelId,
      customerRecord1.id,
      bookingRecord2.id,
    )

    const postResponse = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record/recordEdges`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify([customer1ToBooking1Edge, customer1ToBooking2Edge]),
      },
    )
    expect(postResponse.status).toBe(200)
  })
})
