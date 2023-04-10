import {
  FilledFilterInstance,
  FilledFilterInstanceGroup,
} from '@cozemble/backend-tenanted-api-types'
import { postgresComparatorTemplateFns } from '@cozemble/data-filters-core'

function toRhs(f: FilledFilterInstance) {
  const operation = f.operation
  let rhsValue = null
  if (operation.requiresRhs) {
    if (f.rhsValue === null || f.rhsValue.value === null) {
      throw new Error(`RHS value is null`)
    }
    rhsValue = f.rhsValue.value
  }
  if (operation.postgresComparator._type === 'literal.postgres.comparator') {
    return `${operation.postgresComparator.value} '${rhsValue}'`
  } else {
    return postgresComparatorTemplateFns.fillValue(operation.postgresComparator, rhsValue)
  }
}

function toJsonbPath(f: FilledFilterInstance) {
  const parts = f.dottedIdLhs.split('.')
  return parts
    .map((part, index) => {
      if (index === parts.length - 1) {
        return `->> '${part}'`
      }
      return `-> '${part}'`
    })
    .join(' ')
}

export function formattedFilters(filters: FilledFilterInstanceGroup) {
  if (filters.conjunction !== 'and') {
    throw new Error(`Only 'and' conjunctions are supported`)
  }
  return filters.instances.reduce((acc, f) => ({ ...acc, [toJsonbPath(f)]: ` ${toRhs(f)}` }), {})
}
