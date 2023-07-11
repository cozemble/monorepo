import { beforeAll, describe, expect, test } from 'vitest'
import { appWithTestContainer } from '../../src/appWithTestContainer'
import { dataRecordFns, modelFns } from '@cozemble/model-api'
import {
  DataRecordId,
  ModelId,
  modelReferenceIdFns,
  recordAndEdges,
  RecordAndEdges,
  recordGraphEdgeFns,
  RecordsAndEdges,
  recordsAndEdges,
  systemConfigurationFns,
  tinyValueFns,
} from '@cozemble/model-core'
import {
  getRecordById,
  getRecordsForModel,
  putModels,
  putRecord,
  simulateNewUser,
} from './testHelpers'

const jwtSigningSecret = 'secret'
const port = 3012
const systemConfig = systemConfigurationFns.empty()

const [customerModel, bookingModel] = [
  modelFns.newInstance('Customers'),
  modelFns.newInstance('Bookings'),
]
const models = [customerModel, bookingModel]
const customerRecord1 = dataRecordFns.random(systemConfig, models, customerModel)
const bookingRecord1 = dataRecordFns.random(systemConfig, models, bookingModel)
const bookingRecord2 = dataRecordFns.random(systemConfig, models, bookingModel)
const storedBookingRecord1 = { ...bookingRecord1, seqId: 1 }
const storedBookingRecord2 = { ...bookingRecord2, seqId: 2 }
const storedCustomerRecord1 = { ...customerRecord1, seqId: 1 }

const booking1ToCustomer1 = recordGraphEdgeFns.newInstance(
  modelReferenceIdFns.newInstance(),
  bookingModel.id,
  customerModel.id,
  bookingRecord1.id,
  customerRecord1.id,
  tinyValueFns.id(),
)
const booking2ToCustomer1 = recordGraphEdgeFns.newInstance(
  modelReferenceIdFns.newInstance(),
  bookingModel.id,
  customerModel.id,
  bookingRecord2.id,
  customerRecord1.id,
  tinyValueFns.id(),
)

describe('with a migrated database', () => {
  beforeAll(async () => {
    try {
      await appWithTestContainer(jwtSigningSecret, port)
    } catch (e) {
      console.error(e)
      throw e
    }
  }, 1000 * 90)

  test(`getting a record with no edges returns an empty edge array`, async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    await putModels(port, tenantId, models, bearer)
    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)

    await expectRecordByIdToMatch(
      tenantId,
      customerModel.id,
      customerRecord1.id,
      bearer,
      recordAndEdges(storedCustomerRecord1, []),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      customerModel.id,
      bearer,
      recordsAndEdges([storedCustomerRecord1], []),
    )
  })

  test('can add one edge to a record and retrieve it', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    await putModels(port, tenantId, models, bearer)
    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord1, [booking1ToCustomer1])

    await expectRecordByIdToMatch(
      tenantId,
      bookingModel.id,
      bookingRecord1.id,
      bearer,
      recordAndEdges(storedBookingRecord1, [booking1ToCustomer1]),
    )

    await expectRecordByIdToMatch(
      tenantId,
      customerModel.id,
      customerRecord1.id,
      bearer,
      recordAndEdges(storedCustomerRecord1, [booking1ToCustomer1]),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      customerModel.id,
      bearer,
      recordsAndEdges([storedCustomerRecord1], [booking1ToCustomer1]),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      bookingModel.id,
      bearer,
      recordsAndEdges([storedBookingRecord1], [booking1ToCustomer1]),
    )
  })

  test('can add two edges to one record', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    await putModels(port, tenantId, models, bearer)
    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord1, [booking1ToCustomer1])
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord2, [booking2ToCustomer1])

    await expectRecordByIdToMatch(
      tenantId,
      bookingModel.id,
      bookingRecord1.id,
      bearer,
      recordAndEdges(storedBookingRecord1, [booking1ToCustomer1]),
    )

    await expectRecordByIdToMatch(
      tenantId,
      bookingModel.id,
      bookingRecord2.id,
      bearer,
      recordAndEdges(storedBookingRecord2, [booking2ToCustomer1]),
    )

    await expectRecordByIdToMatch(
      tenantId,
      customerModel.id,
      customerRecord1.id,
      bearer,
      recordAndEdges(storedCustomerRecord1, [booking1ToCustomer1, booking2ToCustomer1]),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      customerModel.id,
      bearer,
      recordsAndEdges([storedCustomerRecord1], [booking1ToCustomer1, booking2ToCustomer1]),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      bookingModel.id,
      bearer,
      recordsAndEdges(
        [storedBookingRecord1, storedBookingRecord2],
        [booking1ToCustomer1, booking2ToCustomer1],
      ),
    )
  })

  test('can remove an edge between two records', async () => {
    const { tenantId, bearer } = await simulateNewUser(port, jwtSigningSecret)
    await putModels(port, tenantId, models, bearer)
    await putRecord(port, tenantId, customerModel, bearer, customerRecord1)
    await putRecord(port, tenantId, bookingModel, bearer, bookingRecord1, [booking1ToCustomer1])
    await putRecord(
      port,
      tenantId,
      bookingModel,
      bearer,
      bookingRecord1,
      [],
      [booking1ToCustomer1.id],
    )

    await expectRecordByIdToMatch(
      tenantId,
      bookingModel.id,
      bookingRecord1.id,
      bearer,
      recordAndEdges(bookingRecord1, []),
    )

    await expectRecordByIdToMatch(
      tenantId,
      customerModel.id,
      customerRecord1.id,
      bearer,
      recordAndEdges(storedCustomerRecord1, []),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      customerModel.id,
      bearer,
      recordsAndEdges([storedCustomerRecord1], []),
    )

    await expectRecordsByModelIdToMatch(
      tenantId,
      bookingModel.id,
      bearer,
      recordsAndEdges([bookingRecord1], []),
    )
  })
})

async function expectRecordByIdToMatch(
  tenantId: string,
  modelId: ModelId,
  recordId: DataRecordId,
  bearer: string,
  expected: RecordAndEdges,
) {
  const actual = await getRecordById(port, tenantId, modelId, recordId, bearer)
  expect(actual).toEqual(expected)
}

async function expectRecordsByModelIdToMatch(
  tenantId: string,
  modelId: ModelId,
  bearer: string,
  expected: RecordsAndEdges,
) {
  const actual = await getRecordsForModel(port, tenantId, modelId, bearer)
  expect(actual.records).toEqual(expect.arrayContaining(expected.records))
  expect(actual.edges).toEqual(expect.arrayContaining(expected.edges))
}
