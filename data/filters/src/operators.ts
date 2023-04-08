import { filterOperatorFns } from './types'

export const equalsFilterOperator = filterOperatorFns.newInstance('equals', 'equals')
export const afterFilterOperator = filterOperatorFns.newInstance('after', 'after')
export const onOrAfterFilterOperator = filterOperatorFns.newInstance('on or after', 'on or after')
export const beforeFilterOperator = filterOperatorFns.newInstance('before', 'before')
export const onOrBeforeFilterOperator = filterOperatorFns.newInstance(
  'on or before',
  'on or before',
)
export const isNullFilterOperator = filterOperatorFns.newInstance('is null', 'is null', false)
export const isNotNullFilterOperator = filterOperatorFns.newInstance(
  'is not null',
  'is not null',
  false,
)
export const containsFilterOperator = filterOperatorFns.newInstance('contains', 'contains')
export const startsWithFilterOperator = filterOperatorFns.newInstance('starts with', 'starts with')
export const endsWithFilterOperator = filterOperatorFns.newInstance('ends with', 'ends with')

export const _ilikeFilterOperator = filterOperatorFns.newInstance('_ilike', '_ilike')

export const stringOperators = [
  equalsFilterOperator,
  containsFilterOperator,
  startsWithFilterOperator,
  endsWithFilterOperator,
]

export const dateOperators = [
  equalsFilterOperator,
  afterFilterOperator,
  onOrAfterFilterOperator,
  beforeFilterOperator,
  onOrBeforeFilterOperator,
  isNullFilterOperator,
  isNotNullFilterOperator,
]
