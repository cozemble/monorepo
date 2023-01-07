import { test, expect } from 'vitest'
import { splitAtFirst } from '../src/string'

test('deals with empty string', () => {
  expect(splitAtFirst(':', '')).toEqual(['', ''])
})

test('deals with nothing before the delimiter', () => {
  expect(splitAtFirst(':', 'aaaaa')).toEqual(['', 'aaaaa'])
})

test('deals with just the delimiter', () => {
  expect(splitAtFirst(':', ':')).toEqual(['', ''])
})

test('deals with nothing before the delimiter', () => {
  expect(splitAtFirst(':', ':aa')).toEqual(['', 'aa'])
})

test('deals with nothing after the delimiter', () => {
  expect(splitAtFirst(':', 'aa:')).toEqual(['aa', ''])
})

test('returns the lhs and rhs of the split', () => {
  expect(splitAtFirst(':', 'aa:aaa:bb')).toEqual(['aa', 'aaa:bb'])
})
