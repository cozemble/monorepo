import { test, expect } from 'vitest'
import { strings } from '../src'

test('can deal with empty content', () => {
  const paras = strings.paragraphs(
    [],
    () => true,
    () => true,
  )
  expect(paras).toHaveLength(0)
})

test('can deal with no matches', () => {
  const paras = strings.paragraphs(
    ['line 1', 'line 2'],
    () => false,
    () => false,
  )
  expect(paras).toHaveLength(0)
})

test('can find paragraphs', () => {
  const paras = strings.paragraphs(
    ['begin', 'line 1', 'line 1.1', 'end', 'begin', 'line 2', 'line 2.1', 'end'],
    (line) => line === 'begin',
    (line) => line === 'end',
  )
  expect(paras).toHaveLength(2)
  expect(paras[0]).toEqual(['begin', 'line 1', 'line 1.1', 'end'])
  expect(paras[1]).toEqual(['begin', 'line 2', 'line 2.1', 'end'])
})

test('can deal with begin and end being the same', () => {
  const paras = strings.paragraphs(
    ['delim', 'line 1', 'line 1.1', 'delim', 'line 2', 'line 2.1', 'end'],
    (line) => line === 'delim',
    (line) => line === 'delim' || line === 'end',
  )
  expect(paras).toHaveLength(2)
  expect(paras[0]).toEqual(['delim', 'line 1', 'line 1.1', 'delim'])
  expect(paras[1]).toEqual(['delim', 'line 2', 'line 2.1', 'end'])
})
