import { describe, expect, test } from 'vitest'
import { dataRecordFns, modelFns, modelIdFns, modelOptions } from '@cozemble/model-api'
import {
  eventSourcedDataRecordFns,
  eventSourcedModelFns,
  EventSourcedRecordGraph,
  eventSourcedRecordGraphFns,
  recordGraphEvents,
  timestampedRecordGraphEdgeFns,
} from '../../src'
import {
  dataRecordIdFns,
  ModelReference,
  modelReferenceFns,
  modelReferenceIdFns,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { mandatory, time } from '@cozemble/lang-util'

describe('given customer and bookings models with a customer has-many bookings and a booking has-one customer', () => {
  const modelReferenceId = modelReferenceIdFns.newInstance('fromBookingToCustomer')
  const customerModelId = modelIdFns.newInstance('customers')
  const bookingModelId = modelIdFns.newInstance('bookings')
  const bookingModel = eventSourcedModelFns.newInstance(
    modelFns.newInstance('Bookings', modelOptions.withId(bookingModelId)),
  )
  const customerModel = eventSourcedModelFns.newInstance(
    modelFns.newInstance(
      'Customers',
      modelOptions.withId(customerModelId),
      modelOptions.withSlot(
        modelReferenceFns.forwardModelReference(
          customerModelId,
          bookingModel.model,
          modelReferenceId,
          'many',
          'one',
        ),
      ),
    ),
  )
  bookingModel.model.slots.push(
    modelReferenceFns.inverseModelReference(
      customerModel.model,
      customerModel.model,
      modelReferenceId,
      'many',
      'one',
    ),
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
  const inverseCustomerToBookingModelReference = bookingModel.model.slots[0] as ModelReference
  const records = [customer1, customer2, booking1, booking2]

  const graph = eventSourcedRecordGraphFns.newInstance(
    records.map((r) => eventSourcedDataRecordFns.fromRecord(models, r)),
    [],
    [],
  )

  describe('when editing the booking side of the graph', () => {
    const clearTheCustomerEvent = recordGraphEvents.recordReferencesChanged(
      booking1,
      inverseCustomerToBookingModelReference,
      [],
    )

    test('clearing the customer when the customer is clear does nothing', () => {
      const mutated = eventSourcedRecordGraphFns.addEvent(graph, clearTheCustomerEvent)
      expect(mutated).toEqual({ ...graph, events: [clearTheCustomerEvent] })
    })

    test('clearing the customer when the customer is set deletes the edge', () => {
      const graphWithBookingWithCustomer = eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(
          booking1,
          inverseCustomerToBookingModelReference,
          [customer1],
        ),
      )
      const edge = firstEdge(graphWithBookingWithCustomer)
      const mutated = eventSourcedRecordGraphFns.addEvent(
        graphWithBookingWithCustomer,
        clearTheCustomerEvent,
      )
      expect(mutated.edges).toHaveLength(0)
      expect(mutated.deletedEdges).toEqual([
        timestampedRecordGraphEdgeFns.newInstance(edge.edge, clearTheCustomerEvent.timestamp),
      ])
    })

    test('setting the customer when the customer is is already set to the same customer does nothing', () => {
      const setTheCustomerEvent = recordGraphEvents.recordReferencesChanged(
        booking1,
        inverseCustomerToBookingModelReference,
        [customer1],
      )
      const graphWithBookingWithCustomer = eventSourcedRecordGraphFns.addEvent(
        graph,
        setTheCustomerEvent,
      )
      const edge = firstEdge(graphWithBookingWithCustomer)
      const graphWithBookingWithSameCustomer = eventSourcedRecordGraphFns.addEvent(
        graphWithBookingWithCustomer,
        setTheCustomerEvent,
      )
      expect(graphWithBookingWithSameCustomer.edges).toEqual([edge])
      expect(graphWithBookingWithSameCustomer.deletedEdges).toHaveLength(0)
    })

    test('setting the customer when the customer is already set to a different customer updates the edge', async () => {
      const booking1HasCustomer1 = eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(
          booking1,
          inverseCustomerToBookingModelReference,
          [customer1],
        ),
      )
      const booking1ToCustomer1Edge = firstEdge(booking1HasCustomer1)
      await time.sleep(1)
      const setBooking1ToCustomer2Event = recordGraphEvents.recordReferencesChanged(
        booking1,
        inverseCustomerToBookingModelReference,
        [customer2],
      )
      const booking1HasCustomer2 = eventSourcedRecordGraphFns.addEvent(
        booking1HasCustomer1,
        setBooking1ToCustomer2Event,
      )
      const booking1ToCustomer2Edge = firstEdge(booking1HasCustomer2)
      expect(booking1ToCustomer2Edge).toEqual({
        ...booking1ToCustomer1Edge,
        timestamp: setBooking1ToCustomer2Event.timestamp,
        edge: { ...booking1ToCustomer1Edge.edge, originRecordId: customer2.id },
      })
    })

    test('attempting to set two customers throws an error', () => {
      try {
        eventSourcedRecordGraphFns.addEvent(
          graph,
          recordGraphEvents.recordReferencesChanged(
            booking1,
            inverseCustomerToBookingModelReference,
            [customer1, customer2],
          ),
        )
        expect('should not get here').toBe('but did')
      } catch (error) {
        expect(error.message).toMatch(/cannot set multiple references/i)
      }
    })

    test('creating a second booking for an existing customer adds an extra edge, such that each booking has one customer and the customer has two bookings', () => {
      const booking1HasCustomer1 = eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(
          booking1,
          inverseCustomerToBookingModelReference,
          [customer1],
        ),
      )
      const booking1HasCustomer1AndBooking2HasCustomer1 = eventSourcedRecordGraphFns.addEvent(
        booking1HasCustomer1,
        recordGraphEvents.recordReferencesChanged(
          booking2,
          inverseCustomerToBookingModelReference,
          [customer1],
        ),
      )
      expect(booking1HasCustomer1AndBooking2HasCustomer1.edges).toHaveLength(2)
      expect(booking1HasCustomer1AndBooking2HasCustomer1.edges[0].edge).toEqual(
        expect.objectContaining({
          originRecordId: customer1.id,
          referenceRecordId: booking1.id,
        }),
      )
      expect(booking1HasCustomer1AndBooking2HasCustomer1.edges[1].edge).toEqual(
        expect.objectContaining({
          originRecordId: customer1.id,
          referenceRecordId: booking2.id,
        }),
      )
      expect(booking1HasCustomer1AndBooking2HasCustomer1.deletedEdges).toHaveLength(0)
    })
  })

  describe('when editing the customer side of the graph', () => {
    const clearTheBookingsEvent = recordGraphEvents.recordReferencesChanged(
      customer1,
      fromCustomerToBookingModelReference,
      [],
    )

    test('clearing the booking when the booking is clear does nothing', () => {
      const mutated = eventSourcedRecordGraphFns.addEvent(graph, clearTheBookingsEvent)
      expect(mutated).toEqual({ ...graph, events: [clearTheBookingsEvent] })
    })

    test('clearing the booking when the booking is set to one booking deletes the edge', () => {
      const customerWithOneBooking = eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
          booking1,
        ]),
      )
      const customer1ToBooking1Edge = firstEdge(customerWithOneBooking)
      const customerWithNoBookings = eventSourcedRecordGraphFns.addEvent(
        customerWithOneBooking,
        clearTheBookingsEvent,
      )
      expect(customerWithNoBookings.edges).toHaveLength(0)
      expect(customerWithNoBookings.deletedEdges).toEqual([
        { ...customer1ToBooking1Edge, timestamp: clearTheBookingsEvent.timestamp },
      ])
    })

    test('clearing the booking when the booking is set to two bookings deletes both edges', () => {
      const customerWithTwoBookings = eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
          booking1,
          booking2,
        ]),
      )
      const customer1ToBooking1Edge = firstEdge(customerWithTwoBookings)
      const customer1ToBooking2Edge = secondEdge(customerWithTwoBookings)
      const customerWithNoBookings = eventSourcedRecordGraphFns.addEvent(
        customerWithTwoBookings,
        clearTheBookingsEvent,
      )
      expect(customerWithNoBookings.edges).toHaveLength(0)
      expect(customerWithNoBookings.deletedEdges).toEqual([
        { ...customer1ToBooking1Edge, timestamp: clearTheBookingsEvent.timestamp },
        { ...customer1ToBooking2Edge, timestamp: clearTheBookingsEvent.timestamp },
      ])
    })

    test('setting the booking when the booking is is already set to the same booking does nothing', () => {
      const setCustomerToBooking1Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking1],
      )
      const customer1WithBooking1 = eventSourcedRecordGraphFns.addEvent(
        graph,
        setCustomerToBooking1Event,
      )
      const customer1WithBooking1Again = eventSourcedRecordGraphFns.addEvent(
        customer1WithBooking1,
        setCustomerToBooking1Event,
      )
      expect(customer1WithBooking1Again).toEqual({
        ...customer1WithBooking1,
        events: [...customer1WithBooking1.events, setCustomerToBooking1Event],
      })
    })

    test('setting the booking when the booking is is already set to a different booking deletes the old edge and creates a new one', async () => {
      const customer1WithBooking1 = eventSourcedRecordGraphFns.addEvent(
        graph,
        recordGraphEvents.recordReferencesChanged(customer1, fromCustomerToBookingModelReference, [
          booking1,
        ]),
      )
      const customer1ToBooking1Edge = firstEdge(customer1WithBooking1)
      await time.sleep(1)
      const setCustomer1ToBooking2Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking2],
      )
      const customer1WithBooking2 = eventSourcedRecordGraphFns.addEvent(
        customer1WithBooking1,
        setCustomer1ToBooking2Event,
      )
      expect(customer1WithBooking2.edges).toHaveLength(1)
      expect(customer1WithBooking2.edges[0].timestamp).toEqual(
        setCustomer1ToBooking2Event.timestamp,
      )
      expect(customer1WithBooking2.deletedEdges).toEqual([
        { ...customer1ToBooking1Edge, timestamp: setCustomer1ToBooking2Event.timestamp },
      ])
    })

    test('setting the bookings to two bookings when one already exists just adds the new booking', async () => {
      const setCustomer1ToBooking1Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking1],
      )
      const customer1WithBooking1 = eventSourcedRecordGraphFns.addEvent(
        graph,
        setCustomer1ToBooking1Event,
      )
      const customer1ToBooking1Edge = firstEdge(customer1WithBooking1)
      await time.sleep(1)
      const setCustomer1ToBookings1And2Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking1, booking2],
      )
      const customer1WithBookings1And2 = eventSourcedRecordGraphFns.addEvent(
        customer1WithBooking1,
        setCustomer1ToBookings1And2Event,
      )
      expect(customer1WithBookings1And2.edges).toHaveLength(2)
      expect(customer1WithBookings1And2.edges[0]).toEqual(customer1ToBooking1Edge)
      expect(customer1WithBookings1And2.edges[1].timestamp).toEqual(
        setCustomer1ToBookings1And2Event.timestamp,
      )
      expect(customer1WithBookings1And2.deletedEdges).toEqual([])
    })

    test('setting the bookings to two bookings when no bookings already exists creates two edges', () => {
      const setCustomer1ToBookings1And2Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking1, booking2],
      )
      const customer1WithBookings1And2 = eventSourcedRecordGraphFns.addEvent(
        graph,
        setCustomer1ToBookings1And2Event,
      )
      expect(customer1WithBookings1And2.edges).toHaveLength(2)
      expect(customer1WithBookings1And2.deletedEdges).toEqual([])
    })

    test('setting the bookings to two bookings that already exist does nothing', () => {
      const setCustomer1ToBookings1And2Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking1, booking2],
      )
      const customer1WithBookings1And2 = eventSourcedRecordGraphFns.addEvent(
        graph,
        setCustomer1ToBookings1And2Event,
      )
      const customer1WithBookings1And2Again = eventSourcedRecordGraphFns.addEvent(
        customer1WithBookings1And2,
        setCustomer1ToBookings1And2Event,
      )
      expect(customer1WithBookings1And2Again).toEqual({
        ...customer1WithBookings1And2,
        events: [...customer1WithBookings1And2.events, setCustomer1ToBookings1And2Event],
      })
    })

    test('clearing unrelated model references leaves bookings unchanged', () => {
      const setCustomer1ToBookings1And2Event = recordGraphEvents.recordReferencesChanged(
        customer1,
        fromCustomerToBookingModelReference,
        [booking1, booking2],
      )
      const customer1WithBookings1And2 = eventSourcedRecordGraphFns.addEvent(
        graph,
        setCustomer1ToBookings1And2Event,
      )
      const modelReference = modelReferenceFns.newInstance(
        modelIdFns.newInstance(),
        [],
        'some reference',
      )
      const mutated = eventSourcedRecordGraphFns.addEvent(
        customer1WithBookings1And2,
        recordGraphEvents.recordReferencesChanged(customer1, modelReference, []),
      )
      expect(mutated.edges).toHaveLength(2)
      expect(mutated.deletedEdges).toEqual([])
    })
  })
})

function firstEdge(graphWithBookingWithCustomer: EventSourcedRecordGraph) {
  return mandatory(graphWithBookingWithCustomer.edges[0], `No first edge`)
}

function secondEdge(graphWithBookingWithCustomer: EventSourcedRecordGraph) {
  return mandatory(graphWithBookingWithCustomer.edges[1], `No second edge`)
}
