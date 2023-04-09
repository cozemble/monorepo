import type { FilterInstance, IdAndLabel, LhsOption } from '@cozemble/data-filters'
import { idAndLabel } from '@cozemble/data-filters'
import type { IdLabelAndValue } from '@cozemble/lang-util'

export type RhsOptionType = IdAndLabel | IdLabelAndValue

export function rhsOptionsAsSelectOptions(lhsOption: LhsOption | null): RhsOptionType[] {
  if (lhsOption === null) {
    return []
  }
  return lhsOption.rhsOptions.reduce((acc, option) => {
    if (option._type === 'user.supplied.rhs.option') {
      acc.push(idAndLabel(option._type, 'fixed value...'))
    }
    if (option._type === 'selectable.rhs.option') {
      acc = [...acc, ...option.options]
    }
    if (option._type === 'real.world.rhs.option') {
      acc.push(idAndLabel(option._type, 'relative value...'))
    }
    return acc
  }, [] as RhsOptionType[])
}

export function isSelectedRhsOption(rhsOption: IdAndLabel, filter: FilterInstance): boolean {
  if (filter.rhsValue === null) {
    return false
  }
  if (filter.rhsValue._type === 'user.supplied.rhs.option.with.value') {
    return rhsOption.id === 'user.supplied.rhs.option'
  }
  return filter.rhsValue.selection?.id === rhsOption.id
}

export function isSelectedRealWorldValue(value: string, filter: FilterInstance) {
  if (filter.rhsValue === null) {
    return value === 'null'
  }
  return false
}
