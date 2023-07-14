import { test, expect } from 'vitest'
import { toDecimalPlaces } from '../src/numbers.js'

test('can round to two decimal places', () => {
  expect(toDecimalPlaces(1, 1)).toBe(1)
  expect(toDecimalPlaces(1.1, 1)).toBe(1.1)
  expect(toDecimalPlaces(1.14, 1)).toBe(1.1)
  expect(toDecimalPlaces(1.15, 1)).toBe(1.2)
  expect(toDecimalPlaces(1.16, 1)).toBe(1.2)

  expect(toDecimalPlaces(1.14, 2)).toBe(1.14)
  expect(toDecimalPlaces(1.141, 2)).toBe(1.14)
  expect(toDecimalPlaces(1.144, 2)).toBe(1.14)
  expect(toDecimalPlaces(1.145, 2)).toBe(1.15)
  expect(toDecimalPlaces(1.146, 2)).toBe(1.15)
})
