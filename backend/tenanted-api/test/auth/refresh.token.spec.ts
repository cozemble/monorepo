import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import * as http from 'http'
import { makeTenant } from '../tenant/testHelpers'
import { uuids } from '@cozemble/lang-util'
import { withAdminPgClient } from '../../src/infra/postgresPool'
import { testEnv } from '../helper'

const jwtSigningSecret = 'secret'
const port = 3006

describe('with a running backend', () => {
  let server: http.Server

  beforeAll(async () => {
    try {
      server = await appWithTestContainer(jwtSigningSecret, port)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('returns user json if refresh code exists, has not been used and has not expired', async () => {
    const refreshToken = await makeLegitRefreshToken()

    const response = await fetch(`http://localhost:3006/${testEnv}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.accessToken).toBeDefined()
  })

  test('second use of refresh token is 401', async () => {
    const refreshToken = await makeLegitRefreshToken()

    const firstResponse = await fetch(`http://localhost:3006/${testEnv}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    expect(firstResponse.status).toBe(200)
    const secondResponse = await fetch(`http://localhost:3006/${testEnv}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    expect(secondResponse.status).toBe(401)
  })

  test('401 if authorization code does not exist', async () => {
    const response = await fetch(`http://localhost:3006/${testEnv}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: '123' }),
    })
    expect(response.status).toBe(401)
  })
})

async function makeRefreshToken(userId: string) {
  return await withAdminPgClient(async (pg) => {
    const refreshToken = uuids.v4()
    await pg.query(
      'insert into refresh_token(env,id, user_id, user_pool, refresh_token) values($1, $2, $3, $4,$5)',
      [testEnv, uuids.v4(), userId, 'root', refreshToken],
    )
    return refreshToken
  })
}

async function makeLegitRefreshToken() {
  const ownerId = uuids.v4()
  const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
  await makeTenant(port, tenantId, 'Tenant 2', ownerId)
  return await makeRefreshToken(ownerId)
}
