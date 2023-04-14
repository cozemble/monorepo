import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import { simulateNewUser } from './testHelpers'
import { testEnv } from '../helper'

const jwtSigningSecret = 'secret'
const port = 3007

describe('with an empty database', () => {
  beforeAll(async () => {
    try {
      await appWithTestContainer(jwtSigningSecret, port)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('can post entities and fetch them', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)

    const inputEntities = [
      { id: { value: '12' }, name: { value: 'Entity 1' }, _type: 'model', body: {} },
      { id: { value: '13' }, name: { value: 'Entity 2' }, _type: 'model', body: {} },
    ]

    // PUT request to insert/update entities
    const putResponse = await fetch(
      `http://localhost:${port}/api/v1/tenant/${testEnv}/${tenantId}/entity`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify(inputEntities),
      },
    )
    expect(putResponse.status).toBe(200)

    // GET request to fetch entities
    const getResponse = await fetch(
      `http://localhost:${port}/api/v1/tenant/${testEnv}/${tenantId}/entity`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
      },
    )
    expect(getResponse.status).toBe(200)

    // Parse the response JSON
    const fetchedEntities = await getResponse.json()

    // Compare the input entities with the fetched entities
    expect(fetchedEntities).toEqual(inputEntities)
  })

  test('returns 404 when fetching entities from a different tenant', async () => {
    // Create the first user and insert entities
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)

    const inputEntities = [
      { id: { value: '12' }, name: { value: 'Entity 1' }, _type: 'model', body: {} },
    ]

    // PUT request to insert/update entities
    const putResponse = await fetch(
      `http://localhost:${port}/api/v1/tenant/${testEnv}/${tenantId}/entity`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify(inputEntities),
      },
    )
    expect(putResponse.status).toBe(200)

    // Create a second user with a different tenant
    const { bearer: differentBearer } = await simulateNewUser(port, jwtSigningSecret)

    // GET request to fetch entities with the second user's credentials
    const getResponse = await fetch(
      `http://localhost:${port}/api/v1/tenant/${testEnv}/${tenantId}/entity`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${differentBearer}`,
        },
      },
    )

    // Expect a 401 status since the user is from a different tenant
    expect(getResponse.status).toBe(404)
  })
})
