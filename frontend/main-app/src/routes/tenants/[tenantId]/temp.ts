import { filterOperations } from '@cozemble/backend-filtering-core'
import {
  afterFilterOperator,
  beforeFilterOperator,
  equalsFilterOperator,
  isNotNullFilterOperator,
  isNullFilterOperator,
  onOrAfterFilterOperator,
  onOrBeforeFilterOperator,
} from '@cozemble/data-filters'

export function tempRegisterDateFilters() {
  filterOperations.register('date.property', [
    equalsFilterOperator,
    afterFilterOperator,
    onOrAfterFilterOperator,
    beforeFilterOperator,
    onOrBeforeFilterOperator,
    isNullFilterOperator,
    isNotNullFilterOperator,
  ])
}
