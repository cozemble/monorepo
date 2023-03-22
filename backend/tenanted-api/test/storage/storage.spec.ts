import { uuids } from '@cozemble/lang-util'
import { beforeAll, describe, expect, test } from 'vitest'

import { appWithTestContainer } from '../../src/appWithTestContainer'
import { makeTenant, makeTenantMemberAccessToken } from '../tenant/testHelpers'
import axios, { AxiosResponse } from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const jwtSigningSecret = 'secret'
const port = 3009

const axiosInstance = axios.create({
  // Other configuration options if needed
  validateStatus: function (_status) {
    // Always return true to treat all status codes as successful
    return true
  },
})
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
    const response = await fetch(`http://localhost:${port}/api/v1/storage/files/${tenantId}`, {
      method: 'POST',
    })
    expect(response.status).toBe(401)
  })

  test('bad request if no files are posted', async () => {
    const response = await fetch(`http://localhost:${port}/api/v1/storage/files/${tenantId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
    })
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

    const response: AxiosResponse = await axiosInstance.post(
      `http://localhost:${port}/api/v1/storage/files/${tenantId}`,
      formData,
      {
        headers: { ...formData.getHeaders(), Authorization: `Bearer ${anotherBearer}` },
      },
    )
    expect(response.status).toBe(403)
  })

  test('can post one file', async () => {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(__dirname + '/one.png'))

    const response: AxiosResponse = await axiosInstance.post(
      `http://localhost:${port}/api/v1/storage/files/${tenantId}`,
      formData,
      {
        headers: { ...formData.getHeaders(), Authorization: `Bearer ${bearer}` },
      },
    )
    expect(response.status).toBe(201)
    const json = response.data
    expect(json[0].fileId).toBeDefined()
    expect(json).toMatchObject([
      {
        originalName: 'one.png',
        mimeType: 'image/png',
        sizeInBytes: 1182,
        imageSize: {
          height: 112,
          width: 298,
        },
      },
    ])
  })

  test('can post a pdf', async () => {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(__dirname + '/blank-document.pdf'))

    const response: AxiosResponse = await axiosInstance.post(
      `http://localhost:${port}/api/v1/storage/files/${tenantId}`,
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
        sizeInBytes: 776,
      },
    ])
  })

  test('can post two files', async () => {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(__dirname + '/one.png'))
    formData.append('file', fs.createReadStream(__dirname + '/two.png'))

    const response: AxiosResponse = await axiosInstance.post(
      `http://localhost:${port}/api/v1/storage/files/${tenantId}`,
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
        imageSize: {
          height: 112,
          width: 298,
        },
      },
      {
        originalName: 'two.png',
        mimeType: 'image/png',
        sizeInBytes: 4532,
        imageSize: {
          height: 256,
          width: 256,
        },
      },
    ])
  })
})
