import { walkTo } from '../src/objects.js'
import { expect, test } from 'vitest'

test('can find top level properties', () => {
  const obj = { a: 1, b: 2 }
  expect(walkTo(obj, 'a')).toBe(1)
  expect(walkTo(obj, 'b')).toBe(2)
})

test('can find nested properties', () => {
  const obj = { a: { b: { c: 1 } } }
  expect(walkTo(obj, 'a', 'b', 'c')).toBe(1)
})

test('returns null if property does not exist', () => {
  const obj = { a: { b: { c: 1 } } }
  expect(walkTo(obj, 'a', 'b', 'd')).toBe(null)
})

test('can index into arrays', () => {
  const obj = { a: [{ b: 1 }, { b: 2 }] }
  expect(walkTo(obj, 'a', '0', 'b')).toBe(1)
  expect(walkTo(obj, 'a', '1', 'b')).toBe(2)
})

test('can index into arrays when the array is the root', () => {
  const obj = [{ b: 1 }, { b: 2 }]
  expect(walkTo(obj, '0', 'b')).toBe(1)
  expect(walkTo(obj, '1', 'b')).toBe(2)
})
