import { uuids } from '@cozemble/lang-util'
import * as http from 'http'
import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../src/appWithTestContainer'
import { BackendModel, BackendTenant } from '@cozemble/backend-tenanted-api-types'
import { modelFns } from '@cozemble/model-api'
import { Model, ModelEvent, modelEventIdFns, timestampEpochMillis } from '@cozemble/model-core'
import { dataRecordFns } from '@cozemble/model-api'
import { DataRecord } from '@cozemble/model-core'

describe('with a migrated database', () => {
  console.log('describe')
  let server: http.Server

  beforeAll(async () => {
    try {
      console.log('Starting server...')
      server = await appWithTestContainer(3002)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('can post a tenant', async () => {
    const response = await postTenant('tenant1')
    expect(response.status).toBe(200)
  })

  test('can get a tenant', async () => {
    await makeTenant('tenant2', 'Tenant 2')
    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/tenant2')
    expect(getTenantResponse.status).toBe(200)
    const tenant = await getTenantResponse.json()
    expect(tenant.id).toBe('tenant2')
    expect(tenant.name).toBe('Tenant 2')
    expect(tenant.models).toEqual([])
  })

  test("can't get a tenant that doesn't exist", async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId)
    expect(getTenantResponse.status).toBe(404)
  })

  test('can put a tenant containing an empty model array', async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(tenantId)

    const putResponse = await fetch(`http://localhost:3002/api/v1/tenant/${tenantId}/model`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        models: [],
      }),
    })
    expect(putResponse.status).toBe(200)
  })

  test('can put a tenant containing a model array', async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(tenantId)

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
      name: 'Test Tenant',
      models: [backendModel],
    }
    const putResponse = await fetch(`http://localhost:3002/api/v1/tenant/${tenantId}/model`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tenant),
    })
    expect(putResponse.status).toBe(200)

    const getTenantResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId)
    expect(getTenantResponse.status).toBe(200)
    const tenantJson = await getTenantResponse.json()
    expect(tenantJson).toEqual(tenant)
  })

  test('can retrieve empty records array', async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(tenantId)
    const [customerModel] = await putModels(tenantId, [modelFns.newInstance('Customer')])

    const getResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
    )
    expect(getResponse.status).toBe(200)
    const records = await getResponse.json()
    expect(records).toEqual({ records: [] })
  })

  test('can put and retrieve a record', async () => {
    const tenantId = uuids.v4().replace(/-/g, '')
    await makeTenant(tenantId)
    const [customerModel] = await putModels(tenantId, [modelFns.newInstance('Customer')])
    const record = dataRecordFns.random([customerModel], customerModel)

    await putRecord(tenantId, customerModel, record)

    const getResponse = await fetch(
      `http://localhost:3002/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
    )
    expect(getResponse.status).toBe(200)
    const records = await getResponse.json()
    expect(records).toEqual({ records: [record] })
  })
})

async function postTenant(id: string, name = 'Test Tenant') {
  return fetch('http://localhost:3002/api/v1/tenant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      name,
    }),
  })
}

async function makeTenant(id: string, name = 'Test Tenant') {
  const postResponse = await postTenant(id, name)
  expect(postResponse.status).toBe(200)
}

async function putModels(tenantId: string, models: Model[]): Promise<Model[]> {
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
    },
    body: JSON.stringify(tenant),
  })
  expect(putResponse.status).toBe(200)
  return models
}

async function putRecord(tenantId: string, model: Model, record: DataRecord) {
  const putResponse = await fetch(
    `http://localhost:3002/api/v1/tenant/${tenantId}/model/${model.id.value}/record`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([record]),
    },
  )
  expect(putResponse.status).toBe(200)
}
