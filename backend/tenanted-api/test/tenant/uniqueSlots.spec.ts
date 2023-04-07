import { beforeAll, describe, expect, test, onTestFailed } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import { makeTenant, makeTenantMemberAccessToken, putModels, putRecord } from './testHelpers'
import { Model } from '@cozemble/model-core'
import { uuids } from '@cozemble/lang-util'
import { dataRecordFns, modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { savableRecords } from '@cozemble/backend-tenanted-api-types'
import { registerStringProperty, stringPropertyOptions } from '@cozemble/model-string-core'
import { withAdminPgClient } from '../../src/infra/postgresPool'

const jwtSigningSecret = 'secret'
const port = 3011

registerStringProperty()

describe('with a migrated database', () => {
  let bearer: string
  let customerModel: Model
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
          propertyFns.newInstance('Phone', stringPropertyOptions.unique),
          propertyFns.newInstance('Email', stringPropertyOptions.unique),
        ),
      )
      await putModels(port, tenantId, [customerModel], bearer)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('saving records with non-unique unique paths returns an error', async () => {
    onTestFailed(async (error) => {
      await withAdminPgClient(async (client) => {
        const result = await client.query('select * from get_messages_since()')
        console.error(JSON.stringify(result.rows, null, 2))
      })
    })

    const firstRecord = dataRecordFns.random([customerModel], customerModel, {
      Phone: '1234567890',
      Email: 'one@email.com',
    })
    const secondRecord = dataRecordFns.random([customerModel], customerModel, {
      Phone: '1234567890',
      Email: 'two@email.com',
    })
    await putRecord(port, tenantId, customerModel, bearer, firstRecord)
    const putResponse = await fetch(
      `http://localhost:${port}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + bearer,
        },
        body: JSON.stringify(savableRecords([secondRecord], [['Phone']])),
      },
    )
    await expect(putResponse.status).toBe(409)
  })
})
