import { uuids } from '@cozemble/lang-util'
import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import {
  BackendModel,
  filterRequestPayloadFns,
  savableRecords,
} from '@cozemble/backend-tenanted-api-types'
import { dataRecordFns, modelFns } from '@cozemble/model-api'
import {
  ModelEvent,
  modelEventIdFns,
  systemConfigurationFns,
  timestampEpochMillis,
} from '@cozemble/model-core'
import {
  makeTenant,
  makeTenantMemberAccessToken,
  putModels,
  putRecord,
  simulateNewUser,
} from './testHelpers'
import { testEnv } from '../helper'

const jwtSigningSecret = 'secret'
const port = 3002
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

  test('anyone can create a tenant', async () => {
    const response = await fetch(`http://localhost:3002/${testEnv}/api/v1/tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _type: 'create.tenant',
        id: 'tenant1',
        name: 'Test Tenant',
        owner: {
          userPool: 'root',
          id: 'owner1',
          email: 'john@smith.com',
          firstName: 'John',
        },
      }),
    })
    expect(response.status).toBe(200)
  })

  test("can't get a tenant without credentials", async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(port, tenantId, 'Tenant 2')
    const getTenantResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}`,
    )
    expect(getTenantResponse.status).toBe(401)
  })

  test('when getting a tenant with credentials, 404 if you are not a tenant member', async () => {
    const { bearer } = await simulateNewUser(port, jwtSigningSecret)
    const otherTenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')

    const getTenantResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${otherTenantId}`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(getTenantResponse.status).toBe(404)
  })

  test('can get a tenant if authenticated as a tenant member', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const getTenantResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(getTenantResponse.status).toBe(200)
    const tenant = await getTenantResponse.json()
    expect(tenant.id).toBe(tenantId)
    expect(tenant.name).toBe('Tenant 2')
    expect(tenant.models).toEqual([])
    expect(tenant.events).toEqual([])
    expect(tenant.entities).toEqual([])
  })

  test("can't get a tenant that doesn't exist", async () => {
    const { bearer } = await simulateNewUser(port, jwtSigningSecret)
    const getTenantResponse = await fetch(`http://localhost:3002/${testEnv}/api/v1/tenant/xx`, {
      headers: {
        Authorization: 'Bearer ' + bearer,
      },
    })
    expect(getTenantResponse.status).toBe(404)
  })

  test('putting models into a tenant you are not a member of is forbidden', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(port, tenantId, 'Tenant 2', ownerId)
    const otherTenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    const otherOwnerId = uuids.v4()
    await makeTenant(port, otherTenantId, 'Tenant 2', otherOwnerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId, jwtSigningSecret)

    const model = modelFns.newInstance('Test model')
    const backendModel: BackendModel = {
      _type: 'backend.model',
      model,
      events: [],
    }
    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${otherTenantId}/model`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(backendModel),
      },
    )
    expect(putResponse.status).toBe(403)
  })

  test('can put models into a tenant', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)

    const model = modelFns.newInstance('Test model')
    const modelEvent: ModelEvent = {
      _type: 'test',
      id: modelEventIdFns.newInstance(),
      modelId: model.id,
      timestamp: timestampEpochMillis(),
      insertionOrder: 0,
    }
    const backendModel: BackendModel = {
      _type: 'backend.model',
      model,
      events: [modelEvent],
    }
    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(backendModel),
      },
    )
    expect(putResponse.status).toBe(200)

    const getTenantResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(getTenantResponse.status).toBe(200)
    const tenantJson = await getTenantResponse.json()
    expect(tenantJson.models).toEqual([model])
    expect(tenantJson.events).toEqual([modelEvent])
  })

  test('fetching records without authentication is a 401', async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(port, tenantId)

    const getResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/x/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance(null, null)),
      },
    )
    expect(getResponse.status).toBe(401)
  })

  test('can retrieve empty records array', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )

    const getResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance(null, null)),
      },
    )
    expect(getResponse.status).toBe(200)
    const records = await getResponse.json()
    expect(records).toEqual({
      queryCount: 0,
      queryPages: 1,
      records: [],
      edges: [],
      totalCount: 0,
      totalPages: 1,
    })
  })

  test('401 if record put is not authenticated ', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savableRecords([record], [], [])),
      },
    )
    await expect(putResponse.status).toBe(401)
  })

  test('can put and retrieve a record', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(savableRecords([record], [], [])),
      },
    )
    await expect(putResponse.status).toBe(200)

    const getResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(filterRequestPayloadFns.newInstance(null, null)),
      },
    )
    expect(getResponse.status).toBe(200)
    const records = await getResponse.json()
    expect(records).toEqual({
      records: [record],
      totalCount: 1,
      totalPages: 1,
      queryCount: 1,
      queryPages: 1,
      edges: [],
    })
  })

  test('can get a record by id', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(savableRecords([record], [], [])),
      },
    )
    await expect(putResponse.status).toBe(200)

    const getResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record/${record.id.value}`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(getResponse.status).toBe(200)
    const fetched = await getResponse.json()
    expect(fetched).toEqual({ record, edges: [] })
  })

  test('can put a record with values that are string arrays', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)
    record.values = {
      ...record.values,
      'string-array': ['a', 'b', 'c'],
    }

    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(savableRecords([record], [], [])),
      },
    )
    await expect(putResponse.status).toBe(200)
  })

  test('can put and delete a record', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)
    await putRecord(port, tenantId, customerModel, bearer, record)

    const deleteResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record/${record.id.value}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(deleteResponse.status).toBe(204)
  })

  test('401 if deleting a record without authentication', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)
    await putRecord(port, tenantId, customerModel, bearer, record)

    const deleteResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record/${record.id.value}`,
      {
        method: 'DELETE',
      },
    )
    expect(deleteResponse.status).toBe(401)
  })

  test('400 if records being put is not an array', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    const [customerModel] = await putModels(
      port,
      tenantId,
      [modelFns.newInstance('Customer')],
      bearer,
    )
    const record = dataRecordFns.random(systemConfig, [customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(record),
      },
    )
    await expect(putResponse.status).toBe(400)
  })
})
