import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import * as http from 'http'

const jwtSigningSecret = 'secret'
const port = 3004

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

  test('can issue the redirect to github that begins the oauth code flow', async () => {
    const response = await fetch(
      'http://localhost:3003/api/v1/auth/login?userPool=root&provider=github&redirectTo=http://localhost:5173',
      { redirect: 'manual' },
    )
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toMatch(
      /^https:\/\/github.com\/login\/oauth\/authorize\?/,
    )
  })

  test('redirect to cozemble.com is legal', async () => {
    const response = await fetch(
      'http://localhost:3003/api/v1/auth/login?userPool=root&provider=github&redirectTo=https://app.cozemble.com',
      { redirect: 'manual' },
    )
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toMatch(
      /^https:\/\/github.com\/login\/oauth\/authorize\?/,
    )
  })

  test('redirect to localhost is legal', async () => {
    const response = await fetch(
      'http://localhost:3003/api/v1/auth/login?userPool=root&provider=github&redirectTo=http://localhost:8080',
      { redirect: 'manual' },
    )
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toMatch(
      /^https:\/\/github.com\/login\/oauth\/authorize\?/,
    )
  })

  test('redirect to anything else is 400', async () => {
    const response = await fetch(
      'http://localhost:3003/api/v1/auth/login?userPool=root&provider=github&redirectTo=https://google.com',
      { redirect: 'manual' },
    )
    expect(response.status).toBe(400)
  })
})
