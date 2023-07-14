import { beforeEach, describe, expect, test } from 'vitest'
import { modelFns } from '@cozemble/model-api'
import {
  eventSourcedModelFns,
  EventSourcedModelList,
  eventSourcedModelListEvents,
  eventSourcedModelListFns,
} from '../../src/index.js'
import {
  ModelReference,
  modelReferenceFns,
  modelReferenceIdFns,
  modelReferenceNameFns,
} from '@cozemble/model-core'

describe('given a customer and ticket model', () => {
  const customerModel = eventSourcedModelFns.newInstance(modelFns.newInstance('Customers'))
  const ticketModel = eventSourcedModelFns.newInstance(modelFns.newInstance('Tickets'))
  const modelReferenceId = modelReferenceIdFns.newInstance()
  const referenceName = modelReferenceNameFns.newInstance('Tickets')

  const addTicketsToCustomerEvent = eventSourcedModelListEvents.addModelReferenceSlot(
    modelReferenceId,
    referenceName,
    customerModel.model.id,
    'many',
  )
  const setFromCustomerToTicketsSlotEvent = eventSourcedModelListEvents.setReferencedModelId(
    modelReferenceId,
    customerModel.model.id,
    ticketModel.model.id,
    'many',
  )
  const setFromCustomerToNullSlotEvent = eventSourcedModelListEvents.setReferencedModelId(
    modelReferenceId,
    customerModel.model.id,
    null,
    'many',
  )

  let list: EventSourcedModelList
  beforeEach(() => {
    list = eventSourcedModelListFns.newInstance([ticketModel, customerModel])
  })

  test("can add an empty 'Tickets' reference slot to customer", () => {
    list = eventSourcedModelListFns.addEvent(list, addTicketsToCustomerEvent)
    const latestTicketModel = list.models[0]
    const latestCustomerModel = list.models[1]
    expect(latestTicketModel).toEqual(ticketModel)
    expect(latestCustomerModel.model.slots[0]).toBeDefined()
    const customerTicketsSlot = latestCustomerModel.model.slots[0] as ModelReference
    expect(customerTicketsSlot._type).toEqual('model.reference')
    expect(customerTicketsSlot.originCardinality).toEqual('many')
    expect(customerTicketsSlot.referencedCardinality).toEqual('many')
    expect(customerTicketsSlot.originModelId).toEqual(customerModel.model.id)
    expect(customerTicketsSlot.name.value).toEqual(addTicketsToCustomerEvent.name.value)
    expect(customerTicketsSlot.id.value).toEqual(addTicketsToCustomerEvent.id.value)
    expect(customerTicketsSlot.inverse).toEqual(false)
    expect(customerTicketsSlot.referencedModelIds).toHaveLength(0)
  })

  test("setting the target of an empty 'Tickets' reference slot to a ticket model updates the customer model and adds an inverse reference to the ticket model", () => {
    list = eventSourcedModelListFns.addEvent(list, addTicketsToCustomerEvent)
    list = eventSourcedModelListFns.addEvent(list, setFromCustomerToTicketsSlotEvent)
    const [latestTicketModel, latestCustomerModel] = list.models
    const customerToTicketSlot = latestCustomerModel.model.slots[0] as ModelReference
    const ticketToCustomerSlot = latestTicketModel.model.slots[0] as ModelReference
    expect(customerToTicketSlot.referencedModelIds).toEqual([ticketModel.model.id])
    expect(ticketToCustomerSlot).toEqual(
      modelReferenceFns.newInstance(
        customerModel.model.id,
        [ticketModel.model.id],
        modelReferenceNameFns.newInstance('Customers'),
        true,
        modelReferenceId,
        'many',
        'many',
      ),
    )
  })

  test("setting the origin cardinality of the 'Tickets' reference slot to 'one' updates the customer model and adds an inverse reference to the ticket model", () => {
    list = eventSourcedModelListFns.addEvent(list, addTicketsToCustomerEvent)
    list = eventSourcedModelListFns.addEvent(list, setFromCustomerToTicketsSlotEvent)
    const event = eventSourcedModelListEvents.setOriginCardinality(
      modelReferenceId,
      customerModel.model.id,
      'one',
    )
    list = eventSourcedModelListFns.addEvent(list, event)
    const [latestTicketModel, latestCustomerModel] = list.models
    const customerToTicketSlot = latestCustomerModel.model.slots[0] as ModelReference
    const ticketToCustomerSlot = latestTicketModel.model.slots[0] as ModelReference
    expect(customerToTicketSlot.originCardinality).toEqual('one')
    expect(customerToTicketSlot.referencedCardinality).toEqual('many')
    expect(ticketToCustomerSlot.originCardinality).toEqual('one')
    expect(ticketToCustomerSlot.referencedCardinality).toEqual('many')
    expect(list.events).toEqual(expect.arrayContaining([event]))
  })

  test("setting the referenced cardinality of the 'Tickets' reference slot to 'one' updates the customer model and adds an inverse reference to the ticket model", () => {
    list = eventSourcedModelListFns.addEvent(list, addTicketsToCustomerEvent)
    list = eventSourcedModelListFns.addEvent(list, setFromCustomerToTicketsSlotEvent)
    list = eventSourcedModelListFns.addEvent(
      list,
      eventSourcedModelListEvents.setReferenceCardinality(
        modelReferenceId,
        ticketModel.model.id,
        'one',
      ),
    )
    const [latestTicketModel, latestCustomerModel] = list.models
    const customerToTicketSlot = latestCustomerModel.model.slots[0] as ModelReference
    const ticketToCustomerSlot = latestTicketModel.model.slots[0] as ModelReference
    expect(customerToTicketSlot.originCardinality).toEqual('many')
    expect(customerToTicketSlot.referencedCardinality).toEqual('one')
    expect(ticketToCustomerSlot.originCardinality).toEqual('many')
    expect(ticketToCustomerSlot.referencedCardinality).toEqual('one')
  })

  test("setting the target of 'Tickets' reference slot to null updates the customer model and removes the inverse reference from the ticket model", () => {
    list = eventSourcedModelListFns.addEvent(list, addTicketsToCustomerEvent)
    list = eventSourcedModelListFns.addEvent(list, setFromCustomerToTicketsSlotEvent)
    list = eventSourcedModelListFns.addEvent(list, setFromCustomerToNullSlotEvent)
    const [latestTicketModel, latestCustomerModel] = list.models
    const customerToTicketSlot = latestCustomerModel.model.slots[0] as ModelReference
    expect(customerToTicketSlot.referencedModelIds).toHaveLength(0)
    expect(latestTicketModel.model.slots).toHaveLength(0)
  })
})
