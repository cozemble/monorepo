import { appWithTestContainer } from '../../src/appWithTestContainer.js'
import { beforeAll, describe, expect, test } from 'vitest'
import { withAdminPgClient } from '../../src/infra/postgresPool.js'

const jwtSigningSecret = 'secret'
const port = 3008

describe('with an empty database, extract_referenced_records:', () => {
  beforeAll(async () => {
    try {
      await appWithTestContainer(jwtSigningSecret, port)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test('can handle an empty object', async () => {
    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [{}])
      expect(result.rows[0].extract_referenced_records).toEqual([])
    })
  })

  test('can handle an nested empty object', async () => {
    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [
        { a: { b: {} } },
      ])
      expect(result.rows[0].extract_referenced_records).toEqual([])
    })
  })

  test('can handle an empty arrays', async () => {
    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [
        { a: { b: [{}, {}] } },
      ])
      expect(result.rows[0].extract_referenced_records).toEqual([])
    })
  })

  test('can handle a top level reference', async () => {
    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [
        { referencedRecordId: { value: '22' } },
      ])
      expect(result.rows[0].extract_referenced_records).toEqual(['22'])
    })
  })

  test('can handle a top level array of references', async () => {
    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [
        {
          array: [{ referencedRecordId: { value: '22' } }, { referencedRecordId: { value: '23' } }],
        },
      ])
      expect(result.rows[0].extract_referenced_records).toEqual(['22', '23'])
    })
  })

  test('uniques the references', async () => {
    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [
        {
          array: [{ referencedRecordId: { value: '22' } }, { referencedRecordId: { value: '22' } }],
        },
      ])
      expect(result.rows[0].extract_referenced_records).toEqual(['22'])
    })
  })

  test('can handle an actual record reference', async () => {
    const actual = {
      id: {
        _type: 'data.record.id',
        value: '32d8d94d-43d3-490c-886a-79e122c4ea7e',
      },
      _type: 'data.record',
      values: {
        'Property 1': {
          _type: 'referenced.records',
          referencedRecords: [
            {
              _type: 'referenced.record',
              referencedRecordId: {
                _type: 'data.record.id',
                value: 'b57522cb-60c5-401a-ad86-f35df21cd0d2',
              },
            },
          ],
        },
        'Property 2': '33',
      },
      modelId: {
        _type: 'model.id',
        value: '921f9e58-e8ff-47f1-bf07-c867154be229',
      },
      createdBy: {
        _type: 'user.id',
        value: 'test-user',
      },
      createdMillis: {
        _type: 'timestamp.epoch.millis',
        value: 1679298157053,
      },
      updatedMillis: {
        _type: 'timestamp.epoch.millis',
        value: 1679298157053,
      },
    }

    await withAdminPgClient(async (client) => {
      const result = await client.query('SELECT * FROM extract_referenced_records($1);', [actual])
      expect(result.rows[0].extract_referenced_records).toEqual([
        'b57522cb-60c5-401a-ad86-f35df21cd0d2',
      ])
    })
  })
})
