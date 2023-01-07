import { test, expect } from 'vitest'
import { compare, startsWith } from '../src/arrays'

test('array startsWith', () => {
  expect(startsWith([], [])).toBe(true)
  expect(startsWith([1], [1])).toBe(true)
  expect(startsWith([1], [1, 2])).toBe(false)
  expect(startsWith([1, 2], [1, 2])).toBe(true)
  expect(startsWith([1, 2], [1, 2, 3])).toBe(false)
})

test('array compare', () => {
  expect(compare([], [])).toMatchObject({ leftOnly: [], both: [], rightOnly: [] })
  expect(compare([1], [])).toMatchObject({ leftOnly: [1], both: [], rightOnly: [] })
  expect(compare([1], [2])).toMatchObject({ leftOnly: [1], both: [], rightOnly: [2] })
  expect(compare([], [2])).toMatchObject({ leftOnly: [], both: [], rightOnly: [2] })
  expect(compare([1, 3], [2, 3])).toMatchObject({ leftOnly: [1], both: [3], rightOnly: [2] })
  expect(compare([1, 3], [1, 3])).toMatchObject({ leftOnly: [], both: [1, 3], rightOnly: [] })
})
