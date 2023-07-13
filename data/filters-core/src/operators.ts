import {
  filterOperatorFns,
  literalPostgresComparator,
  postgresComparatorTemplateFns,
} from './types.js'

export const equalsFilterOperator = filterOperatorFns.newInstance(
  'equals',
  'equals',
  literalPostgresComparator('='),
)
export const afterFilterOperator = filterOperatorFns.newInstance(
  'after',
  'after',
  literalPostgresComparator('>'),
)
export const onOrAfterFilterOperator = filterOperatorFns.newInstance(
  'on or after',
  'on or after',
  literalPostgresComparator('>='),
)
export const beforeFilterOperator = filterOperatorFns.newInstance(
  'before',
  'before',
  literalPostgresComparator('<'),
)
export const onOrBeforeFilterOperator = filterOperatorFns.newInstance(
  'on or before',
  'on or before',
  literalPostgresComparator('<='),
)
export const isNullFilterOperator = filterOperatorFns.newInstance(
  'is null',
  'is null',
  literalPostgresComparator('is null'),
  false,
)
export const isNotNullFilterOperator = filterOperatorFns.newInstance(
  'is not null',
  'is not null',
  literalPostgresComparator('is not null'),
  false,
)
export const containsFilterOperator = filterOperatorFns.newInstance(
  'contains',
  'contains',
  postgresComparatorTemplateFns.newInstance("ilike '%{{value}}%'"),
)
export const startsWithFilterOperator = filterOperatorFns.newInstance(
  'starts with',
  'starts with',
  postgresComparatorTemplateFns.newInstance("ilike '{{value}}%'"),
)
export const endsWithFilterOperator = filterOperatorFns.newInstance(
  'ends with',
  'ends with',
  postgresComparatorTemplateFns.newInstance("ilike '%{{value}}'"),
)

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
