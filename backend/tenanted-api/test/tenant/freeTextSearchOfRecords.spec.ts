import { beforeAll, describe, expect, test } from 'vitest'
import { makeTenant, makeTenantMemberAccessToken, putModels, putRecords } from './testHelpers'
import { uuids } from '@cozemble/lang-util'
import { dataRecordFns, modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { Model } from '@cozemble/model-core'
import { registerStringProperty } from '@cozemble/model-string-core'
import { appWithTestContainer } from '../../src/appWithTestContainer'

const jwtSigningSecret = 'secret'
const port = 3003

registerStringProperty()

describe('with customer records', () => {
  let bearer: string
  let customerModel: Model
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
        modelOptions.withProperties(
          propertyFns.newInstance('First Name'),
          propertyFns.newInstance('Last Name'),
        ),
      )
      await putModels(port, tenantId, [customerModel], bearer)
      const records = [
        dataRecordFns.random([customerModel], customerModel, {
          'First Name': 'John',
          'Last Name': 'Smith',
        }),

        dataRecordFns.random([customerModel], customerModel, {
          'First Name': 'Jane',
          'Last Name': 'Smith',
        }),
        dataRecordFns.random([customerModel], customerModel, {
          'First Name': 'John',
          'Last Name': 'Doe',
        }),
        dataRecordFns.random([customerModel], customerModel, {
          'First Name': 'Jane',
          'Last Name': 'Doe',
        }),
        dataRecordFns.random([customerModel], customerModel, {
          'First Name': 'Janet',
          'Last Name': 'Norman',
        }),
      ]
      await putRecords(port, tenantId, customerModel, bearer, records)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('can find all records', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(5)
    expect(records.queryCount).toBe(5)
    expect(records.totalCount).toBe(5)
  })

  test('can find all Janes', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record?q=Jane`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(3)
    expect(records.queryCount).toBe(3)
    expect(records.totalCount).toBe(5)
  })

  test('search is case insensitive', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record?q=jane`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(3)
    expect(records.queryCount).toBe(3)
    expect(records.totalCount).toBe(5)
  })

  test('can find the one Janet', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record?q=Janet`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(1)
    expect(records.queryCount).toBe(1)
    expect(records.totalCount).toBe(5)
  })

  test('can find all that start with Jan', async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record?q=Jan`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(3)
    expect(records.queryCount).toBe(3)
    expect(records.totalCount).toBe(5)
  })
})
