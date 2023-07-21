import { uuids } from '@cozemble/lang-util'
import { beforeAll, describe, expect, test } from 'vitest'

import { appWithTestContainer } from '../../src/appWithTestContainer.ts'
import { makeTenant, makeTenantMemberAccessToken } from '../tenant/testHelpers.ts'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { testEnv } from '../helper.ts'

const jwtSigningSecret = 'secret'
const port = 3009

describe('with an empty database, extract_referenced_records:', () => {
  let bearer: string
  let tenantId: string

  beforeAll(async () => {
    try {
      await appWithTestContainer(jwtSigningSecret, port)
      const ownerId = uuids.v4()
      tenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
      await makeTenant(port, tenantId, 'Tenant 2', ownerId)
      bearer = await makeTenantMemberAccessToken(tenantId, ownerId, jwtSigningSecret)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('401 if no authorization', async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}`,
      {
        method: 'POST',
      },
    )
    expect(response.status).toBe(401)
  })

  test('bad request if no files are posted', async () => {
    const response = await fetch(
      `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
      },
    )
    expect(response.status).toBe(400)
  })

  test('forbidden if wrong tenant', async () => {
    const anotherOwnerId = uuids.v4()
    const anotherTenantId = `root.tenants.${uuids.v4()}`.replace(/-/g, '')
    await makeTenant(port, anotherTenantId, 'Tenant 2', anotherOwnerId)
    const anotherBearer = await makeTenantMemberAccessToken(
      anotherTenantId,
      anotherOwnerId,
      jwtSigningSecret,
    )

    const formData = new FormData()
    formData.append('file', fs.createReadStream(__dirname + '/one.png'))

    const response = await axiosInstance.post(
      `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}`,
      formData,
      {
        headers: { ...formData.getHeaders(), Authorization: `Bearer ${anotherBearer}` },
      },
    )
    expect(response.status).toBe(403)
  })

  test('can post one file', async () => {
    const json = await postFile(tenantId, bearer)
    expect(json[0].fileId).toBeDefined()
    expect(json).toMatchObject([
      {
        originalName: 'one.png',
        mimeType: 'image/png',
        sizeInBytes: 1182,
      },
    ])
  })

  test('can get a file as json', async () => {
    const json = await postFile(tenantId, bearer)
    const fileId = json[0].fileId

    const fetched = await axiosInstance.get(
      `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}/${fileId}`,
      {
        headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
      },
    )
    expect(fetched.status).toBe(200)
    expect(fetched.data.thumbnailUrl).toBeDefined()
    expect(fetched.data).toMatchObject({
      fileId,
      originalName: 'one.png',
      mimeType: 'image/png',
      sizeInBytes: 1182,
      storageDetails: {},
      storageProvider: 'memory',
      metadata: {},
    })
  })

  test('can get a signed url to view the full attachment', async () => {
    const postResponse = await postFile(tenantId, bearer)
    const fileId = postResponse[0].fileId
    const fileName = postResponse[0].originalName

    const signedUrlResponse = await axiosInstance.post(
      `http://localhost:${port}/${testEnv}/api/v1/storage/urls/${tenantId}/${fileId}/${encodeURIComponent(
        fileName,
      )}`,
      null,
      {
        headers: { Authorization: `Bearer ${bearer}` },
      },
    )
    expect(signedUrlResponse.status).toBe(201)
    expect(signedUrlResponse.data.url).toBe(
      `placeholder url for tenant id ${tenantId} and attachment id ${fileId}`,
    )
  })

  test('can post a pdf', async () => {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(__dirname + '/blank-document.pdf'))

    const response = await axiosInstance.post(
      `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}`,
      formData,
      {
        headers: { ...formData.getHeaders(), Authorization: `Bearer ${bearer}` },
      },
    )
    expect(response.status).toBe(201)
    const json = response.data
    expect(json).toMatchObject([
      {
        originalName: 'blank-document.pdf',
        mimeType: 'application/pdf',
        sizeInBytes: 832,
      },
    ])
  })

  test('can post two files', async () => {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(__dirname + '/one.png'))
    formData.append('file', fs.createReadStream(__dirname + '/two.png'))

    const response = await axiosInstance.post(
      `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}`,
      formData,
      {
        headers: { ...formData.getHeaders(), Authorization: `Bearer ${bearer}` },
      },
    )
    expect(response.status).toBe(201)
    const json = response.data
    expect(json).toMatchObject([
      {
        originalName: 'one.png',
        mimeType: 'image/png',
        sizeInBytes: 1182,
      },
      {
        originalName: 'two.png',
        mimeType: 'image/png',
        sizeInBytes: 4532,
      },
    ])
  })
})

const axiosInstance = axios.create({
  validateStatus: function (_status) {
    return true
  },
})

async function postFile(tenantId: string, bearer: string, fileName = 'one.png') {
  const formData = new FormData()
  formData.append('file', fs.createReadStream(__dirname + `/${fileName}`))

  const response = await axiosInstance.post(
    `http://localhost:${port}/${testEnv}/api/v1/storage/files/${tenantId}`,
    formData,
    {
      headers: { ...formData.getHeaders(), Authorization: `Bearer ${bearer}` },
    },
  )
  expect(response.status).toBe(201)
  return response.data
}
