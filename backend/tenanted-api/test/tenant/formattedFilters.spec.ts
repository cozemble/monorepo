import { expect, test } from 'vitest'
import { formattedFilters } from '../../src/tenants/formattedFilters.js'
import { filledFilterInstanceGroupFns } from '@cozemble/backend-tenanted-api-types'
import { afterFilterOperator } from '@cozemble/data-filters-core'
import { containsFilterOperator, startsWithFilterOperator } from '@cozemble/data-filters-core'

test('can format the equals operator', () => {
  const formatted = formattedFilters(filledFilterInstanceGroupFns.whereLhsEqRhs('c', 'd'))
  expect(formatted).toEqual({ "->> 'c'": " = 'd'" })
})

test('can format the gte operator', () => {
  const formatted = formattedFilters(
    filledFilterInstanceGroupFns.where('dateOfBirth', afterFilterOperator, 'April 1st'),
  )
  expect(formatted).toEqual({ "->> 'dateOfBirth'": " > 'April 1st'" })
})

test('can format the startsWith operator', () => {
  const formatted = formattedFilters(
    filledFilterInstanceGroupFns.where('firstName', startsWithFilterOperator, 'Fre'),
  )
  expect(formatted).toEqual({ "->> 'firstName'": " ilike 'Fre%'" })
})

test('can format the startsWith operator', () => {
  const formatted = formattedFilters(
    filledFilterInstanceGroupFns.where('firstName', containsFilterOperator, 'Fre'),
  )
  expect(formatted).toEqual({ "->> 'firstName'": " ilike '%Fre%'" })
})

test('deals with nested properties', () => {
  const formatted = formattedFilters(filledFilterInstanceGroupFns.whereLhsEqRhs('a.b.c', 'd'))
  expect(formatted).toEqual({ "-> 'a' -> 'b' ->> 'c'": " = 'd'" })
})
