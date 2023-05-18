import { beforeEach, describe, expect, test } from 'vitest'
import { modelFns } from '@cozemble/model-api'
import { EventSourcedModelList } from '../src/EventSourcedModel'
import {
  eventSourcedModelListEvents,
  eventSourcedModelListFns,
} from '../src/eventSourcedModelListFns'
import { eventSourcedModelFns } from '../src'
import { ModelReference, modelReferenceIdFns, modelReferenceNameFns } from '@cozemble/model-core'
import { modelReferenceFns } from '@cozemble/model-core/dist/esm'

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
  const setFromCustomerToTicketsSlotEvent = eventSourcedModelListEvents.setToModelReference(
    modelReferenceId,
    customerModel.model.id,
    ticketModel.model.id,
    'many',
  )
  const setFromCustomerToNullSlotEvent = eventSourcedModelListEvents.setToModelReference(
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
    const slot = latestCustomerModel.model.slots[0] as ModelReference
    expect(slot._type).toEqual('model.reference')
    expect(slot.cardinality).toEqual('many')
    expect(slot.name.value).toEqual(addTicketsToCustomerEvent.name.value)
    expect(slot.id.value).toEqual(addTicketsToCustomerEvent.id.value)
    expect(slot.side).toEqual('from')
    expect(slot.referencedModelIds).toHaveLength(0)
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
        [customerModel.model.id],
        modelReferenceNameFns.newInstance('Customers'),
        'to',
        modelReferenceId,
        'many',
      ),
    )
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
