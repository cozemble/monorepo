import { describe, expect, test } from 'vitest'
import { dataRecordFns, modelFns, modelIdFns, modelOptions } from '@cozemble/model-api'
import { eventSourcedModelFns } from '../../src'
import {
  dataRecordIdFns,
  ModelReference,
  modelReferenceFns,
  modelReferenceIdFns,
  RecordGraphEdge,
  recordGraphEdgeFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { eventSourcedRecordGraphFns } from '../../src/records/EventSourcedRecordGraph'
import { eventSourcedDataRecordFns } from '../../src/records/EventSourcedDataRecord'
import { recordGraphEvents } from '../../src/records/recordGraphEvents'
import { objects } from '@cozemble/lang-util'

describe('given a customer and bookings arrangement', () => {
  const modelReferenceId = modelReferenceIdFns.newInstance('fromBookingToCustomer')
  const bookingModel = eventSourcedModelFns.newInstance(
    modelFns.newInstance('Bookings', modelOptions.withId(modelIdFns.newInstance('bookings'))),
  )
  const customerModel = eventSourcedModelFns.newInstance(
    modelFns.newInstance(
      'Customers',
      modelOptions.withId(modelIdFns.newInstance('customers')),
      modelOptions.withSlot(
        modelReferenceFns.forwardToModel(bookingModel.model, modelReferenceId, 'many'),
      ),
    ),
  )
  bookingModel.model.slots.push(
    modelReferenceFns.inverseToModel(customerModel.model, modelReferenceId, 'one'),
  )
  const models = [bookingModel, customerModel].map((m) => m.model)
  const systemConfiguration = systemConfigurationFns.empty()
  const customer1 = dataRecordFns.random(systemConfiguration, models, customerModel.model)
  const customer2 = dataRecordFns.random(systemConfiguration, models, customerModel.model)
  const booking1 = dataRecordFns.random(systemConfiguration, models, bookingModel.model)
  const booking2 = dataRecordFns.random(systemConfiguration, models, bookingModel.model)
  customer1.id = dataRecordIdFns.newInstance('customer1')
  customer2.id = dataRecordIdFns.newInstance('customer2')
  booking1.id = dataRecordIdFns.newInstance('booking1')
  booking2.id = dataRecordIdFns.newInstance('booking2')
  const fromCustomerToBookingModelReference = customerModel.model.slots[0] as ModelReference
  const fromBookingToCustomerModelReference = bookingModel.model.slots[0] as ModelReference

  const graph = eventSourcedRecordGraphFns.newInstance(
    [customer1, customer2, booking1, booking2].map((r) =>
      eventSourcedDataRecordFns.fromRecord(models, r),
    ),
    [],
    [],
  )

  test('can add a booking to a customer', () => {
    const mutatedGraph = eventSourcedRecordGraphFns.addEvent(
      graph,
      recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
        booking1,
      ]),
    )
    expect(mutatedGraph.edges).toHaveLength(1)
    expectEdgeMatch(
      mutatedGraph.edges[0],
      recordGraphEdgeFns.newInstance(modelReferenceId, customer1.id, booking1.id),
    )
  })

  test('can add two bookings to a customer', () => {
    const mutatedGraph = eventSourcedRecordGraphFns.addEvents(
      graph,
      recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
        booking1,
        booking2,
      ]),
    )
    expect(mutatedGraph.edges).toHaveLength(2)
    expectEdgeMatch(
      mutatedGraph.edges[0],
      recordGraphEdgeFns.newInstance(modelReferenceId, customer1.id, booking1.id),
    )
    expectEdgeMatch(
      mutatedGraph.edges[1],
      recordGraphEdgeFns.newInstance(modelReferenceId, customer1.id, booking2.id),
    )
  })

  test('can remove a booking from a customer and retain the other ', () => {
    const initialGraph = eventSourcedRecordGraphFns.addEvents(
      graph,
      recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
        booking1,
        booking2,
      ]),
    )
    const mutatedGraph = eventSourcedRecordGraphFns.addEvents(
      initialGraph,
      recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
        booking1,
      ]),
    )
    expect(mutatedGraph.edges).toHaveLength(1)
    expectEdgeMatch(
      mutatedGraph.edges[0],
      recordGraphEdgeFns.newInstance(modelReferenceId, customer1.id, booking1.id),
    )
  })

  test('can remove all bookings from a customer', () => {
    const initialGraph = eventSourcedRecordGraphFns.addEvents(
      graph,
      recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
        booking1,
        booking2,
      ]),
    )
    const mutatedGraph = eventSourcedRecordGraphFns.addEvents(
      initialGraph,
      recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, []),
    )
    expect(mutatedGraph.edges).toHaveLength(0)
  })

  test('can add a customer to a booking', () => {
    const mutatedGraph = eventSourcedRecordGraphFns.addEvent(
      graph,
      recordGraphEvents.recordReferencesChanged(booking1, fromBookingToCustomerModelReference, [
        customer1,
      ]),
    )

    expect(mutatedGraph.edges).toHaveLength(1)
    expectEdgeMatch(
      mutatedGraph.edges[0],
      recordGraphEdgeFns.newInstance(modelReferenceId, customer1.id, booking1.id),
    )
  })

  test('can remove a customer from a booking', () => {
    const initialGraph = eventSourcedRecordGraphFns.addEvent(
      graph,
      recordGraphEvents.recordReferencesChanged(booking1, fromBookingToCustomerModelReference, [
        customer1,
      ]),
    )
    const mutatedGraph = eventSourcedRecordGraphFns.addEvent(
      initialGraph,
      recordGraphEvents.recordReferencesChanged(booking1, fromBookingToCustomerModelReference, []),
    )
    expect(mutatedGraph.edges).toHaveLength(0)
  })

  test('trying to add a second customer to a booking is an error', () => {
    try {
      eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(booking1, fromBookingToCustomerModelReference, [
          customer1,
          customer2,
        ]),
      )
      expect("shouldn't get here").toBe(true)
    } catch (e) {
      expect(e.message).toMatch('Cannot add multiple references to a one to one relationship')
    }
  })
})

function expectEdgeMatch(a: RecordGraphEdge, b: RecordGraphEdge) {
  expect(objects.dropKeys(a, 'id')).toEqual(objects.dropKeys(b, 'id'))
}
