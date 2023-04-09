import { filterOperations, filterValueProviders } from '@cozemble/data-filters-config'
import {
  afterFilterOperator,
  beforeFilterOperator,
  equalsFilterOperator,
  isNotNullFilterOperator,
  isNullFilterOperator,
  onOrAfterFilterOperator,
  onOrBeforeFilterOperator,
} from '@cozemble/data-filters-core'
import FilterValueProviderUsingPropertyEditor from '../../../lib/data/filtering/FilterValueProviderUsingPropertyEditor.svelte'

export function tempRegisterDateFilters() {
  const key = { value: 'date.property' }
  filterOperations.register(key, [
    equalsFilterOperator,
    afterFilterOperator,
    onOrAfterFilterOperator,
    beforeFilterOperator,
    onOrBeforeFilterOperator,
    isNullFilterOperator,
    isNotNullFilterOperator,
  ])

  filterValueProviders.register(key, {
    component: FilterValueProviderUsingPropertyEditor,
    props: { propertyType: key },
  })
}
