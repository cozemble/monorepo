import { beforeEach, describe, expect, test } from 'vitest'
import { modelFns } from '@cozemble/model-api'
import { EventSourcedModelList } from '../src/EventSourcedModel'
import {
  eventSourcedModelListEvents,
  eventSourcedModelListFns,
} from '../src/eventSourcedModelListFns'
import { eventSourcedModelFns } from '../src'
import { ModelReference, modelReferenceIdFns, modelReferenceNameFns } from '@cozemble/model-core'

describe('given a customer and ticket model', () => {
  const customerModel = eventSourcedModelFns.newInstance(modelFns.newInstance('Customers'))
  const ticketModel = eventSourcedModelFns.newInstance(modelFns.newInstance('Tickets'))
  let list: EventSourcedModelList
  beforeEach(() => {
    list = eventSourcedModelListFns.newInstance([ticketModel, customerModel])
  })

  test('can add a tickets reference to customer', () => {
    const modelReferenceId = modelReferenceIdFns.newInstance()
    const addTicketsSlotEvent = eventSourcedModelListEvents.addModelReferenceSlot(
      modelReferenceId,
      modelReferenceNameFns.newInstance('Tickets'),
      customerModel.model.id,
      'many',
    )
    list = eventSourcedModelListFns.addEvent(list, addTicketsSlotEvent)
    const latestTicketModel = list.models[0]
    const latestCustomerModel = list.models[1]
    expect(latestTicketModel).toEqual(ticketModel)
    expect(latestCustomerModel.model.slots[0]).toBeDefined()
    const slot = latestCustomerModel.model.slots[0] as ModelReference
    expect(slot._type).toEqual('model.reference')
    expect(slot.cardinality).toEqual('many')
    expect(slot.name.value).toEqual(addTicketsSlotEvent.name.value)
    expect(slot.id.value).toEqual(addTicketsSlotEvent.id.value)
    expect(slot.side).toEqual('from')
    expect(slot.referencedModelIds).toHaveLength(0)

    const setFromCustomerToTicketsSlotEvent = eventSourcedModelListEvents.setToModelReference(
      modelReferenceId,
      customerModel.model.id,
      ticketModel.model.id,
      'many',
    )
    list = eventSourcedModelListFns.addEvent(list, setFromCustomerToTicketsSlotEvent)

    const latestTicketModel2 = list.models[0]
    const customerReferenceSlot = latestTicketModel2.model.slots[0] as ModelReference
    expect(customerReferenceSlot._type).toEqual('model.reference')
    expect(customerReferenceSlot.cardinality).toEqual('many')
    expect(customerReferenceSlot.name.value).toEqual(customerModel.model.name.value)
    expect(customerReferenceSlot.id.value).toEqual(modelReferenceId.value)
    expect(customerReferenceSlot.side).toEqual('to')
    expect(customerReferenceSlot.referencedModelIds).toEqual([customerModel.model.id])

    const latestCustomerModel2 = list.models[1]
    const customerToTicketSlot = latestCustomerModel2.model.slots[0] as ModelReference
    expect(customerToTicketSlot._type).toEqual('model.reference')
    expect(customerToTicketSlot.cardinality).toEqual('many')
    expect(customerToTicketSlot.name.value).toEqual(addTicketsSlotEvent.name.value)
    expect(customerToTicketSlot.id.value).toEqual(modelReferenceId.value)
    expect(customerToTicketSlot.side).toEqual('from')
    expect(customerToTicketSlot.referencedModelIds).toEqual([ticketModel.model.id])
  })
})
