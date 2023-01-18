import { expect, test } from 'vitest'
import type { DataRecordCreatedEvent, DataRecordEditEvent } from '@cozemble/data-editor-sdk'
import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { dataRecordFns, dataRecordPathFns, modelFns, testExports } from '@cozemble/model-api'
import { strings, uuids } from '@cozemble/lang-util'
import type { Model } from '@cozemble/model-core'
import { gql } from '@cozemble/graphql-util'

/**
 * mutation MyMutation {
 *   insert_address(objects: {line_1: "Flat 6", postcode: "CM23 XXX"}) {
 *     returning {
 *       id
 *       line_1
 *       line_2
 *       postcode
 *     }
 *   }
 * }
 **/

/**
 * mutation MyMutation {
 *   insert_invoice(objects: {customer: {data: {email: "mike@email.com", first_name: "Mike", last_name: "Smith", phone: "555-5555-555"}}}) {
 *     affected_rows
 *     returning {
 *       id
 *       customer {
 *         id
 *         first_name
 *         last_name
 *         email
 *         phone
 *         address {
 *           id
 *           line_1
 *           line_2
 *           postcode
 *         }
 *       }
 *     }
 *   }
 * }
 **/

/**
 * mutation MyMutation {
 *   insert_invoice(objects: {customer: {data: {email: "mike@email.com", first_name: "Mike", last_name: "Smith", phone: "555-5555-555", address: {data: {line_1: "Flat 6", postcode: "XXX"}}}}}) {
 *     affected_rows
 *     returning {
 *       id
 *       customer {
 *         id
 *         first_name
 *         last_name
 *         email
 *         phone
 *         address {
 *           id
 *           line_1
 *           line_2
 *           postcode
 *         }
 *       }
 *     }
 *   }
 * } */

/**
 * mutation MyMutation {
 *   insert_invoice(objects: {customer: {data: {email: "mike@email.com", first_name: "Mike", last_name: "Smith", phone: "555-5555-555", address: {data: {line_1: "Flat 6", postcode: "CM23 3WW"}}}}, line_items: {data: [{item: "Apple", price: "1.20", quantity: "2"}, {item: "Pear", price: "1.89", quantity: "3"}]}}) {
 *     returning {
 *       id
 *       customer {
 *         id
 *         first_name
 *         last_name
 *         email
 *         phone
 *         address {
 *           id
 *           line_1
 *           line_2
 *           postcode
 *         }
 *       }
 *       line_items {
 *         id
 *         item
 *         price
 *         quantity
 *       }
 *     }
 *   }
 * } **/

const addressModel = testExports.addressModel
const invoiceModels = testExports.invoiceModels

export interface GqlMutation {
  _type: 'gql.mutation'
  mutation: string
}

export function gqlMutation(mutation: string): GqlMutation {
  return {
    _type: 'gql.mutation',
    mutation: gql.parse(mutation),
  }
}

interface ValueAssignment {
  name: string
  value: string
}

export class HasuraInsertMutationBuilder {
  constructor(
    private readonly tableName: string,
    private readonly returning: string[] = [],
    private readonly values: ValueAssignment[] = [],
  ) {}

  build(): GqlMutation {
    return gqlMutation(`mutation MyMutation {
  insert_${strings.snakeCase(this.tableName)}(objects: {${this._valueAssignments()}}) {
    returning {${this._returningStatements()}
    }
  }
}`)
  }

  private _valueAssignments() {
    return this.values
      .map((valueAssignment) => `${valueAssignment.name}: ${valueAssignment.value}`)
      .join(', ')
  }

  private _returningStatements() {
    return this.returning.map((returning) => returning).join('\n')
  }

  addValueAssignment(name: string, value: string) {
    this.values.push({ name: strings.snakeCase(name), value })
    return this
  }

  addReturning(returning: string) {
    this.returning.push(strings.snakeCase(returning))
    return this
  }
}

function addDataRecordEditEvent(
  builder: HasuraInsertMutationBuilder,
  event: DataRecordEditEvent,
): HasuraInsertMutationBuilder {
  if (event._type === 'data.record.value.changed') {
    return builder.addValueAssignment(
      strings.snakeCase(event.path.lastElement.name.value),
      JSON.stringify(event.newValue),
    )
  } else {
    throw new Error('Unexpected event type: ' + event._type)
  }
}

function addReturningStatements(
  models: Model[],
  model: Model,
  builder: HasuraInsertMutationBuilder,
) {
  return model.properties.reduce(
    (builder, property) => builder.addReturning(property.name.value),
    builder,
  )
}

function hasuraInsertMutation(
  models: Model[],
  createdEvent: DataRecordCreatedEvent,
  remainingEvents: DataRecordEditEvent[],
): GqlMutation {
  const model = modelFns.findById(models, createdEvent.modelId)
  let builder = remainingEvents.reduce(
    addDataRecordEditEvent,
    new HasuraInsertMutationBuilder(model.name.value),
  )
  builder = addReturningStatements(models, model, builder)
  return builder.build()
}

function hasuraMutationFromEvents(models: Model[], events: DataRecordEditEvent[]): GqlMutation {
  if (events.length === 0) {
    throw new Error('No events')
  }
  const [firstEvent, ...remainingEvents] = events
  if (firstEvent._type !== 'data.record.created') {
    throw new Error('First event must be a data.record.created')
  }
  return hasuraInsertMutation(models, firstEvent, remainingEvents)
}

test('can create a simple object mutation', () => {
  const addressRecord = dataRecordFns.newInstance(addressModel, 'test-user')
  const addressLine1 = uuids.v4()
  const addressPostcode = uuids.v4()
  const events = [
    dataRecordEditEvents.recordCreated(addressModel.id, 'user1'),
    dataRecordEditEvents.valueChanged(
      addressRecord,
      dataRecordPathFns.fromNames(invoiceModels, addressModel, 'Line 1'),
      null,
      addressLine1,
      null,
    ),
    dataRecordEditEvents.valueChanged(
      addressRecord,
      dataRecordPathFns.fromNames(invoiceModels, addressModel, 'Post code'),
      null,
      addressPostcode,
      null,
    ),
  ]

  const mutation = hasuraMutationFromEvents(invoiceModels, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_address(objects: {line_1: "${addressLine1}", post_code: "${addressPostcode}"}) {
    returning {
      line_1
      line_2
      post_code
    }
  }
}`,
    ),
  )
})
