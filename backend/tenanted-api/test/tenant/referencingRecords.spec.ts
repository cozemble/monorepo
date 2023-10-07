import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer.js'
import { makeTenant, makeTenantMemberAccessToken, putModels, putRecords } from './testHelpers.js'
import { uuids } from '@cozemble/lang-util'
import {
  DataRecord,
  Model,
  modelIdFns,
  modelReferenceFns,
  referencedRecordsFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { dataRecordFns, modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { testEnv } from '../helper.js'
import { registerJsonStringProperty } from '@cozemble/model-properties-core'

const jwtSigningSecret = 'secret'
const port = 3010

registerJsonStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('Given a Customer with a Booking', () => {
  let bearer: string
  let customerModel: Model
  let bookingModel: Model
  let customerRecords: DataRecord[]
  let bookingRecords: DataRecord[]
  let tenantId: string

  beforeAll(async () => {
    try {
      await appWithTestContainer(jwtSigningSecret, port)
      const ownerId = uuids.v4()
      tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
      await makeTenant(port, tenantId, 'Tenant 2', ownerId)
      bearer = await makeTenantMemberAccessToken(tenantId, ownerId, jwtSigningSecret)
      customerModel = modelFns.newInstance(
        'Customer',
        modelOptions.withProperties(propertyFns.newInstance('First Name')),
      )
      const bookingModelId = modelIdFns.newInstance('bookings')
      bookingModel = modelFns.newInstance(
        'Booking',
        modelOptions.withId(bookingModelId),
        modelOptions.withSlot(
          modelReferenceFns.newInstance(bookingModelId, [customerModel.id], 'Customer'),
        ),
      )
      const models = [customerModel, bookingModel]
      await putModels(port, tenantId, models, bearer)
      customerRecords = [
        dataRecordFns.random(systemConfig, models, customerModel, {
          'First Name': 'John',
          'Last Name': 'Smith',
        }),

        dataRecordFns.random(systemConfig, models, customerModel, {
          'First Name': 'Jane',
          'Last Name': 'Smith',
        }),
        dataRecordFns.random(systemConfig, models, customerModel),
      ]
      await putRecords(port, tenantId, customerModel, bearer, customerRecords)
      bookingRecords = [
        dataRecordFns.random(systemConfig, models, bookingModel, {
          Customer: referencedRecordsFns.addReference(
            referencedRecordsFns.empty(),
            customerModel.id,
            customerRecords[0].id,
          ),
        }),
        dataRecordFns.random(systemConfig, models, bookingModel, {
          Customer: referencedRecordsFns.addReference(
            referencedRecordsFns.empty(),
            customerModel.id,
            customerRecords[1].id,
          ),
        }),
      ]
      await putRecords(port, tenantId, bookingModel, bearer, bookingRecords)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('returns no booking records for customer with no booking', async () => {
    const customerWithNoBooking = dataRecordFns.random(systemConfig, [customerModel], customerModel)

    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${bookingModel.id.value}/referencing/${customerWithNoBooking.id.value}`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(0)
  })

  test('returns the booking records for customer with booking', async () => {
    const customerWithBooking = customerRecords[0]
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${bookingModel.id.value}/referencing/${customerWithBooking.id.value}`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records).toEqual([{ ...bookingRecords[0], seqId: 1 }])
  })
})
