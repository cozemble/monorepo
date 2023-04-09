import type { LhsOption } from '@cozemble/data-filters'

export function onlyUserSelectedRhsValues(lhsOption: LhsOption): boolean {
  return (
    lhsOption.rhsOptions.length === 1 &&
    lhsOption.rhsOptions[0]._type === 'user.supplied.rhs.option'
  )
}
