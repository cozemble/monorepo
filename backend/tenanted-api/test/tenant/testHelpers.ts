import { expect } from 'vitest'
import { DataRecord, Model } from '@cozemble/model-core'
import { uuids } from '@cozemble/lang-util'
import { BackendModel } from '@cozemble/backend-tenanted-api-types'
import jwt from 'jsonwebtoken'
import { savableRecords } from '@cozemble/backend-tenanted-api-types'
import { testEnv } from '../helper'

async function postTenant(port: number, id: string, name = 'Test Tenant', ownerId = uuids.v4()) {
  return await fetch(`http://localhost:${port}/api/v1/tenant/${testEnv}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      _type: 'create.tenant',
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

export async function makeTenant(
  port: number,
  id: string,
  name = 'Test Tenant',
  ownerId = uuids.v4(),
) {
  const postResponse = await postTenant(port, id, name, ownerId)
  expect(postResponse.status).toBe(200)
}

export async function putModels(
  port: number,
  tenantId: string,
  models: Model[],
  accessToken: string,
): Promise<Model[]> {
  const backendModels: BackendModel[] = models.map((m) => ({
    _type: 'backend.model',
    model: m,
    events: [],
  }))
  const putResponse = await fetch(
    `http://localhost:${port}/api/v1/tenant/${testEnv}/${tenantId}/model`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
      body: JSON.stringify(backendModels),
    },
  )
  expect(putResponse.status).toBe(200)
  return models
}

export async function putRecord(
  port: number,
  tenantId: string,
  model: Model,
  bearer: string,
  record: DataRecord,
) {
  return putRecords(port, tenantId, model, bearer, [record])
}

export async function putRecords(
  port: number,
  tenantId: string,
  model: Model,
  bearer: string,
  records: DataRecord[],
) {
  const putResponse = await fetch(
    `http://localhost:${port}/api/v1/tenant/${testEnv}/${tenantId}/model/${model.id.value}/record`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + bearer,
      },
      body: JSON.stringify(savableRecords(records)),
    },
  )
  await expect(putResponse.status).toBe(200)
}

export async function makeTenantMemberAccessToken(
  tenantId: string,
  ownerId: string,
  jwtSigningSecret: string,
) {
  const payload = {
    iss: 'https://cozemble.com',
    tenants: [tenantId],
    sub: ownerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }
  return jwt.sign(payload, jwtSigningSecret, {})
}

export async function simulateNewUser(port: number, jwtSigningSecret: string) {
  const ownerId = uuids.v4()
  const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
  await makeTenant(port, tenantId, 'Tenant 2', ownerId)
  const bearer = await makeTenantMemberAccessToken(tenantId, ownerId, jwtSigningSecret)
  return { tenantId, ownerId, bearer }
}
