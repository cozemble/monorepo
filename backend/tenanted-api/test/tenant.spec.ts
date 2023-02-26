import { uuids } from '@cozemble/lang-util'
import * as http from 'http'
import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../src/appWithTestContainer'
import { BackendModel, BackendTenant } from '@cozemble/backend-tenanted-api-types'
import { modelFns } from '@cozemble/model-api'
import { modelEventIdFns, timestampEpochMillis } from '@cozemble/model-core'
import { ModelEvent } from '@cozemble/model-core'

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

describe('with a migrated database', () => {
  let server: http.Server

  beforeAll(async () => {
    try {
      server = await appWithTestContainer(3002)
    } catch (e) {
      console.error(e)
      throw e
    }
  })

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

    const putResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId, {
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
    const putResponse = await fetch('http://localhost:3002/api/v1/tenant/' + tenantId, {
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
})
