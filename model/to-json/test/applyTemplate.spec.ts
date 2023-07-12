import { expect, test } from 'vitest'
import { applyTemplate } from '../src/index.ts'

const data = {
  'Invoice ID': 'invoice#33',
  Customer: {
    'First name': 'John',
    'Last name': 'Smith',
    Phone: '1234567890',
    Email: 'john@email.com',
    Address: {
      'Line 1': '123 Main St',
      'Line 2': 'Town X',
      'Post code': '12345',
    },
  },
  'Line Items': [
    {
      Quantity: '1',
      Name: 'Item 1',
      Price: '10.00',
    },
    {
      Quantity: '2',
      Name: 'Item 2',
      Price: '20.00',
    },
  ],
}

test('can apply a simple template', () => {
  const templateString = 'First name = {{Customer.First name}}, Email = {{Customer.Email}}'
  const resultString = applyTemplate(templateString, data)
  expect(resultString).toBe('First name = John, Email = john@email.com')
})

test('can get array values into a template', () => {
  const templateString = 'Name1 = {{Line Items[0].Name}}, Name2 = {{Line Items[1].Name}}'
  const resultString = applyTemplate(templateString, data)
  expect(resultString).toBe('Name1 = Item 1, Name2 = Item 2')
})
