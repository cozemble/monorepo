import { expect, test } from 'vitest'
import { dataRecordFns, testExports } from '@cozemble/model-api'
import { registerStringProperty } from '@cozemble/model-string-core'
import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { hasuraMutationFromEvents } from '../src'
import { headAndTailFns } from '@cozemble/lang-util'
import { gqlMutation } from '@cozemble/graphql-core'

registerStringProperty()

const invoiceModel = testExports.invoiceModel
const invoiceModels = testExports.invoiceModels

test('can create a root object', () => {
  const invoice = dataRecordFns.random(invoiceModels, invoiceModel)
  const events = [dataRecordEditEvents.recordDeleted(invoiceModel.id, invoice.id, 'user1')]

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    [],
    invoice,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  delete0: delete_invoice(where: {id: {_eq: "${invoice.id.value}"}}) {
    affected_rows
  }
}`,
    ),
  )
})
