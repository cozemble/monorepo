import { expect, test } from 'vitest'
import { toJsonCase } from '../src/string.js'

test("converts words ending in 'ID' to 'Id'", () => {
  expect(toJsonCase('invoiceId')).toBe('invoiceId')
})

test('handles abbreviations', () => {
  expect(toJsonCase('Employee SSN')).toBe('employeeSsn')
})

test('handles words', () => {
  expect(toJsonCase('Invoice ID')).toBe('invoiceId')
})
