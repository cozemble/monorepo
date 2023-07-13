import { test, expect } from 'vitest'
import { random } from '../src/random.js'

test('can get random element of single element array', () => {
  for (let i = 0; i < 20; i++) {
    expect(random.elementOfArray([3])).toBe(3)
  }
})

test('can get random element of two element array', () => {
  const collected = []
  for (let i = 0; i < 20; i++) {
    collected.push(random.elementOfArray([3, 5]))
  }
  expect(collected.some((e) => e === 3)).toBe(true)
  expect(collected.some((e) => e === 5)).toBe(true)
})
