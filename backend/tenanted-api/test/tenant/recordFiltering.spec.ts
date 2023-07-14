import { beforeAll, describe, expect, test } from 'vitest'
import { makeTenant, makeTenantMemberAccessToken, putModels, putRecords } from './testHelpers.ts'
import { uuids } from '@cozemble/lang-util'
import { dataRecordFns, modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { Model, Property, systemConfigurationFns } from '@cozemble/model-core'
import { appWithTestContainer } from '../../src/appWithTestContainer.ts'
import {
  filledFilterInstanceGroupFns,
  filterRequestPayloadFns,
} from '@cozemble/backend-tenanted-api-types'
import { testEnv } from '../helper.ts'
import { registerJsonStringProperty } from '@cozemble/model-properties-core'

const jwtSigningSecret = 'secret'
const port = 3003

registerJsonStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('with customer records', () => {
  let bearer: string
  let customerModel: Model
  let dateOfBirthProperty: Property
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
          propertyFns.newInstance('Date of Birth'),
        ),
      )
      dateOfBirthProperty = customerModel.slots[2] as Property
      await putModels(port, tenantId, [customerModel], bearer)
      const records = [
        dataRecordFns.random(systemConfig, [customerModel], customerModel, {
          'First Name': 'John',
          'Last Name': 'Smith',
          'Date of Birth': '2023-04-10',
        }),

        dataRecordFns.random(systemConfig, [customerModel], customerModel, {
          'First Name': 'Jane',
          'Last Name': 'Smith',
          'Date of Birth': '2023-04-10',
        }),
        dataRecordFns.random(systemConfig, [customerModel], customerModel, {
          'First Name': 'John',
          'Last Name': 'Doe',
          'Date of Birth': '2023-04-11',
        }),
        dataRecordFns.random(systemConfig, [customerModel], customerModel, {
          'First Name': 'Jane',
          'Last Name': 'Doe',
          'Date of Birth': '2023-04-12',
        }),
        dataRecordFns.random(systemConfig, [customerModel], customerModel, {
          'First Name': 'Janet',
          'Last Name': 'Norman',
          'Date of Birth': '2023-04-09',
        }),
      ]
      await putRecords(port, tenantId, customerModel, bearer, records)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test("can't find records where property equals", async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(
          filterRequestPayloadFns.newInstance(
            null,
            filledFilterInstanceGroupFns.whereLhsEqRhs(dateOfBirthProperty.id.value, '2023-04-10'),
          ),
        ),
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(2)
    expect(records.queryCount).toBe(2)
    expect(records.totalCount).toBe(5)
  })

  test("can't find records where property is greater than", async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(
          filterRequestPayloadFns.newInstance(
            null,
            filledFilterInstanceGroupFns.whereLhsIsAfterRhs(
              dateOfBirthProperty.id.value,
              '2023-04-11',
            ),
          ),
        ),
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(1)
    expect(records.queryCount).toBe(1)
    expect(records.totalCount).toBe(5)
  })

  test('can find all records', async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance(null, null)),
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(5)
    expect(records.queryCount).toBe(5)
    expect(records.totalCount).toBe(5)
  })

  test('can search for all Janes', async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance('Jane', null)),
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
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance('jane', null)),
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(3)
    expect(records.queryCount).toBe(3)
    expect(records.totalCount).toBe(5)
  })

  test('can search for the one Janet', async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance('Janet', null)),
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(1)
    expect(records.queryCount).toBe(1)
    expect(records.totalCount).toBe(5)
  })

  test('can search for all that start with Jan', async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance('Jan', null)),
      },
    )
    expect(response.status).toBe(200)
    const records = await response.json()
    expect(records.records.length).toBe(3)
    expect(records.queryCount).toBe(3)
    expect(records.totalCount).toBe(5)
  })
})
