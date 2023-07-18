import { beforeAll, describe, expect, onTestFailed, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer.js'
import { makeTenant, makeTenantMemberAccessToken, putModels, putRecord } from './testHelpers.js'
import { Model, systemConfigurationFns } from '@cozemble/model-core'
import { uuids } from '@cozemble/lang-util'
import { dataRecordFns, modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { savableRecords } from '@cozemble/backend-tenanted-api-types'
import { withAdminPgClient } from '../../src/infra/postgresPool.js'
import { testEnv } from '../helper'
import {
  jsonStringPropertyOptions,
  registerJsonStringProperty,
} from '@cozemble/model-properties-core'

const jwtSigningSecret = 'secret'
const port = 3011

registerJsonStringProperty()
const systemConfig = systemConfigurationFns.empty()

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
          propertyFns.newInstance('Phone', jsonStringPropertyOptions.unique),
          propertyFns.newInstance('Email', jsonStringPropertyOptions.unique),
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

    const firstRecord = dataRecordFns.random(systemConfig, [customerModel], customerModel, {
      Phone: '1234567890',
      Email: 'one@email.com',
    })
    const secondRecord = dataRecordFns.random(systemConfig, [customerModel], customerModel, {
      Phone: '1234567890',
      Email: 'two@email.com',
    })
    await putRecord(port, tenantId, customerModel, bearer, firstRecord)
    const putResponse = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/tenant/${tenantId}/model/${customerModel.id.value}/record`,
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
