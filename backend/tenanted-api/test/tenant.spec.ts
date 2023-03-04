import { uuids } from '@cozemble/lang-util'
import * as http from 'http'
import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer, PgDetails } from '../src/appWithTestContainer'
import { BackendModel, BackendTenant } from '@cozemble/backend-tenanted-api-types'
import { dataRecordFns, modelFns } from '@cozemble/model-api'
import { Model, ModelEvent, modelEventIdFns, timestampEpochMillis } from '@cozemble/model-core'
import jwt from 'jsonwebtoken'

const jwtSigningSecret = 'secret'

async function makeTenantMemberAccessToken(tenantId: string, ownerId: string) {
  const payload = {
    iss: 'https://cozemble.com',
    tenants: [tenantId],
    sub: ownerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }
  return jwt.sign(payload, jwtSigningSecret, {})
}

const localPg: PgDetails = {
  host: '127.0.0.1',
  port: '5432',
  database: 'postgres',
  username: 'app_user',
  password: 'mypassword',
}

describe('with a migrated database', () => {
  let server: http.Server

  beforeAll(async () => {
    try {
      server = await appWithTestContainer(jwtSigningSecret, 3002)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('anyone can create a tenant', async () => {
    const response = await fetch('http://localhost:3002/api/v1/tenant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
    await makeTenant(tenantId, 'Tenant 2')
    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId)
    expect(getTenantResponse.status).toBe(401)
  })

  test('when getting a tenant with credentials, 404 if you are not a tenant member', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const otherTenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')

    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/' + otherTenantId, {
      headers: {
        Authorization: 'Bearer ' + bearer,
      },
    })
    expect(getTenantResponse.status).toBe(404)
  })

  test('can get a tenant if authenticated as a tenant member', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId, {
      headers: {
        Authorization: 'Bearer ' + bearer,
      },
    })
    expect(getTenantResponse.status).toBe(200)
    const tenant = await getTenantResponse.json()
    expect(tenant.id).toBe(tenantId)
    expect(tenant.name).toBe('Tenant 2')
    expect(tenant.models).toEqual([])
  })

  test("can't get a tenant that doesn't exist", async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/xx', {
      headers: {
        Authorization: 'Bearer ' + bearer,
      },
    })
    expect(getTenantResponse.status).toBe(404)
  })

  test('can put a tenant containing an empty model array', async () => {
    const ownerId = uuids.v4()
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(tenantId, ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)

    const putResponse = await fetch(`http://localhost:3002/api/v1/tenant/${tenantId}/model`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + bearer,
      },
      body: JSON.stringify({
        models: [],
      }),
    })
    expect(putResponse.status).toBe(200)
  })

  test('putting models into a tenant you are not a member of is forbidden', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const otherTenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    const otherOwnerId = uuids.v4()
    await makeTenant(otherTenantId, 'Tenant 2', otherOwnerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)

    const model = modelFns.newInstance('Test model')
    const backendModel: BackendModel = {
      id: uuids.v4(),
      name: 'Test Model',
      definition: model,
      events: [],
    }
    const tenant: BackendTenant = {
      id: otherTenantId,
      name: 'Tenant 2',
      models: [backendModel],
    }
    const putResponse = await fetch(`http://localhost:3002/api/v1/tenant/${otherTenantId}/model`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + bearer,
      },
      body: JSON.stringify(tenant),
    })
    expect(putResponse.status).toBe(403)
  })

  test('can put models into a tenant', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)

    const model = modelFns.newInstance('Test model')
    const modelEvent: ModelEvent = {
      _type: 'test',
      id: modelEventIdFns.newInstance(),
      modelId: model.id,
      timestamp: timestampEpochMillis(),
      insertionOrder: 0,
    }
    const backendModel: BackendModel = {
      id: uuids.v4(),
      name: 'Test Model',
      definition: model,
      events: [
        {
          id: modelEvent.id.value,
          definition: modelEvent,
        },
      ],
    }
    const tenant: BackendTenant = {
      id: tenantId,
      name: 'Tenant 2',
      models: [backendModel],
    }
    const putResponse = await fetch(`http://localhost:3002/api/v1/tenant/${tenantId}/model`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + bearer,
      },
      body: JSON.stringify(tenant),
    })
    expect(putResponse.status).toBe(200)

    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId, {
      headers: {
        Authorization: 'Bearer ' + bearer,
      },
    })
    expect(getTenantResponse.status).toBe(200)
    const tenantJson = await getTenantResponse.json()
    expect(tenantJson).toEqual(tenant)
  })

  test('fetching records without authentication is a 401', async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(tenantId)

    const getResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/x/record`,
    )
    expect(getResponse.status).toBe(401)
  })

  test('can retrieve empty records array', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const [customerModel] = await putModels(tenantId, [modelFns.newInstance('Customer')], bearer)

    const getResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(getResponse.status).toBe(200)
    const records = await getResponse.json()
    expect(records).toEqual({ records: [], count: 0, totalPages: 1 })
  })

  test('401 is record put is not authenticated ', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const [customerModel] = await putModels(tenantId, [modelFns.newInstance('Customer')], bearer)
    const record = dataRecordFns.random([customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([record]),
      },
    )
    await expect(putResponse.status).toBe(401)
  })

  test('can put and retrieve a record', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const [customerModel] = await putModels(tenantId, [modelFns.newInstance('Customer')], bearer)
    const record = dataRecordFns.random([customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify([record]),
      },
    )
    await expect(putResponse.status).toBe(200)

    const getResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        headers: {
          Authorization: 'Bearer ' + bearer,
        },
      },
    )
    expect(getResponse.status).toBe(200)
    const records = await getResponse.json()
    expect(records).toEqual({ records: [record], count: 1, totalPages: 1 })
  })

  test('400 if records being put is not an array', async () => {
    const ownerId = uuids.v4()
    const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(tenantId, 'Tenant 2', ownerId)
    const bearer = await makeTenantMemberAccessToken(tenantId, ownerId)
    const [customerModel] = await putModels(tenantId, [modelFns.newInstance('Customer')], bearer)
    const record = dataRecordFns.random([customerModel], customerModel)

    const putResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
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

async function postTenant(id: string, name = 'Test Tenant', ownerId = uuids.v4()) {
  return fetch('http://localhost:3002/api/v1/tenant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      name,
      owner: {
        userPool: 'root',
        id: ownerId,
        email: 'john@smith.com',
        firstName: 'John',
      },
    }),
  })
}

async function makeTenant(id: string, name = 'Test Tenant', ownerId = uuids.v4()) {
  const postResponse = await postTenant(id, name, ownerId)
  expect(postResponse.status).toBe(200)
}

async function putModels(tenantId: string, models: Model[], accessToken: string): Promise<Model[]> {
  const backendModels: BackendModel[] = models.map((m) => ({
    id: m.id.value,
    name: m.name.value,
    definition: m,
    events: [],
  }))
  const tenant: BackendTenant = {
    id: tenantId,
    name: 'Test Tenant',
    models: backendModels,
  }
  const putResponse = await fetch(`http://localhost:3002/api/v1/tenant/${tenantId}/model`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify(tenant),
  })
  expect(putResponse.status).toBe(200)
  return models
}
