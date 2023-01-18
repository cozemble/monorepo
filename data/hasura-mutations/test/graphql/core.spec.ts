import { expect, test } from 'vitest'
import {
  arrayRelationship,
  gqlRelationshipFns,
  item,
  objectRelationship,
  printLines,
  value,
} from '../../src/graphql/core'

test('can print returning statement for a simple object ', () => {
  const relationship = objectRelationship(
    'customer',
    [],
    ['first_name', 'last_name', 'email', 'phone'],
    [],
  )
  expect(printLines(gqlRelationshipFns.printReturning(relationship))).toBe(
    relationship.returning.join('\n'),
  )
})

test('can print returning for a nested-nested object', () => {
  const relationship = objectRelationship(
    'invoice',
    [],
    ['invoice_id'],
    [
      objectRelationship(
        'customer',
        [],
        ['first_name', 'last_name', 'email', 'phone'],
        [objectRelationship('address', [], ['line_1', 'line_2', 'postcode'], [])],
      ),
    ],
  )
  expect(printLines(gqlRelationshipFns.printReturning(relationship))).toBe(
    `invoice_id
customer {
  first_name
  last_name
  email
  phone
  address {
    line_1
    line_2
    postcode
  }
}`,
  )
})

test('can print returning for an array relationship', () => {
  const relationship = objectRelationship(
    'invoice',
    [],
    ['invoice_id'],
    [arrayRelationship('line_items', ['quantity', 'item', 'price'], [])],
  )
  expect(printLines(gqlRelationshipFns.printReturning(relationship))).toBe(
    `invoice_id
line_items {
  quantity
  item
  price
}`,
  )
})

test('can print the set statement for a simple object', () => {
  const relationship = objectRelationship(
    'address',
    [
      value('line_1', '1 Main Street'),
      value('line_2', 'Back road'),
      value('post_code', 'CM23 1QQ'),
    ],
    [],
    [],
  )
  expect(gqlRelationshipFns.printSetStatement(relationship)).toBe(
    '{line_1: "1 Main Street", line_2: "Back road", post_code: "CM23 1QQ"}',
  )
})

test('can print the set statement for a nested-nested object', () => {
  const relationship = objectRelationship(
    'invoice',
    [value('invoice_id', '123')],
    [],
    [
      objectRelationship(
        'customer',
        [
          value('first_name', 'John'),
          value('last_name', 'Smith'),
          value('email', 'john@email.com'),
          value('phone', '555-5555-555'),
        ],
        [],
        [
          objectRelationship('address', [
            value('line_1', '1 Main Street'),
            value('line_2', 'Toy town'),
            value('post_code', 'CM23 1AA'),
          ]),
        ],
      ),
    ],
  )
  expect(gqlRelationshipFns.printSetStatement(relationship)).toBe(
    '{invoice_id: "123", customer: {data: {first_name: "John", last_name: "Smith", email: "john@email.com", phone: "555-5555-555", address: {data: {line_1: "1 Main Street", line_2: "Toy town", post_code: "CM23 1AA"}}}}}',
  )
})

test('can print the set statement for an array relationship', () => {
  const relationship = objectRelationship(
    'invoice',
    [value('invoice_id', '123')],
    [],
    [
      arrayRelationship(
        'line_items',
        [],
        [
          item([value('quantity', '1'), value('item', 'Banana'), value('price', '0.99')]),
          item([value('quantity', '2'), value('item', 'Apple'), value('price', '0.85')]),
        ],
      ),
    ],
  )
  expect(gqlRelationshipFns.printSetStatement(relationship)).toBe(
    '{invoice_id: "123", line_items: {data: [{quantity: "1", item: "Banana", price: "0.99"}, {quantity: "2", item: "Apple", price: "0.85"}]}}',
  )
})
