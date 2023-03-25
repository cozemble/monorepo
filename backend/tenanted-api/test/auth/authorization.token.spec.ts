import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import * as http from 'http'
import { makeTenant } from '../tenant/testHelpers'
import { uuids } from '@cozemble/lang-util'
import { withAdminPgClient } from '../../src/infra/postgresPool'

const jwtSigningSecret = 'secret'
const port = 3005

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

  test('returns user json if auth code exists, has not been used and has not expired', async () => {
    const authorizationToken = await makeLegitAuthToken()

    const response = await fetch(`http://localhost:3005/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationToken }),
    })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.accessToken).toBeDefined()
  })

  test('second use of authorization code is 401', async () => {
    const authorizationToken = await makeLegitAuthToken()

    const firstResponse = await fetch(`http://localhost:3005/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationToken }),
    })
    expect(firstResponse.status).toBe(200)
    const secondResponse = await fetch(`http://localhost:3005/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationToken }),
    })
    expect(secondResponse.status).toBe(401)
  })

  test('401 if authorization code does not exist', async () => {
    const response = await fetch(`http://localhost:3005/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationToken: '123' }),
    })
    expect(response.status).toBe(401)
  })
})

async function makeAuthorizationToken(userId: string) {
  return await withAdminPgClient(async (pg) => {
    const response = await pg.query('select * from insert_auth_token($1, $2)', [userId, 'root'])
    return response.rows[0].insert_auth_token
  })
}

async function makeLegitAuthToken() {
  const ownerId = uuids.v4()
  const tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
  await makeTenant(port, tenantId, 'Tenant 2', ownerId)
  return await makeAuthorizationToken(ownerId)
}
