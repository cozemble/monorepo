import type { FilterAction } from './actions'
import {
  FilterGroup,
  FilterGroupList,
  FilterInstance,
  filterInstance,
  FilterInstanceList,
  LhsOption,
  selectableRhsOptionWithSelection,
  userSuppliedRhsOptionWithValue,
} from './types'

import { mandatory, uuids } from '@cozemble/lang-util'

type Option = {
  id: string
}

function applyActionToFilter(
  action: FilterAction,
  filter: FilterInstance,
  lhsOptions: LhsOption[],
): FilterInstance {
  if (action._type === 'lhs.changed.action' && action.filterInstanceId === filter.id) {
    const selectedLhsOption = mandatory(
      lhsOptions.find((o: Option ) => o.id === action.lhsOptionId),
      `No lhs option with id ${action.lhsOptionId}`,
    )
    return { ...filter, selectedLhsOption, selectedOperatorOption: null, rhsValue: null }
  }
  if (action._type === 'operator.changed.action' && action.filterInstanceId === filter.id) {
    const selectedLhsOption = mandatory(
      filter.selectedLhsOption,
      'Got a change operator event without a selected LHS',
    )
    const selectedOperatorOption = mandatory(
      selectedLhsOption.operators.find((o: Option) => o.id === action.operatorOptionId),
      `No operator with id ${action.operatorOptionId}`,
    )
    return { ...filter, selectedOperatorOption, rhsValue: null }
  }
  if (action._type === 'rhs.changed.action' && action.filterInstanceId === filter.id) {
    if (
      filter.rhsValue === null ||
      filter.rhsValue._type === 'user.supplied.rhs.option.with.value'
    ) {
      return { ...filter, rhsValue: userSuppliedRhsOptionWithValue(action.rhsValue) }
    }
    throw new Error(`to do: ${action}`)
  }
  if (action._type === 'rhs.option.type.changed.action' && action.filterInstanceId === filter.id) {
    if (action.selectedRhsOption.id === 'user.supplied.rhs.option') {
      return { ...filter, rhsValue: userSuppliedRhsOptionWithValue(null) }
    }
    return { ...filter, rhsValue: selectableRhsOptionWithSelection(action.selectedRhsOption) }
  }
  return filter
}

function applyActionToFilterInstanceList(
  action: FilterAction,
  list: FilterInstanceList,
  lhsOptions: LhsOption[],
): FilterInstanceList {
  if (action._type === 'new.filter.instance.action' && action.filterInstanceListId === list.id) {
    return { ...list, filters: [...list.filters, filterInstance(lhsOptions)] }
  }
  if (
    action._type === 'filter.instance.list.conjunction.changed.action' &&
    action.filterInstanceListId === list.id
  ) {
    return { ...list, conjunction: action.conjunction }
  }
  if (action._type === 'delete.filter.instance.action' && action.filterInstanceListId === list.id) {
    return { ...list, filters: list.filters.filter((f) => f.id !== action.filterInstanceId) }
  }
  return {
    ...list,
    filters: list.filters.map((filter) => applyActionToFilter(action, filter, lhsOptions)),
  }
}

function applyActionToFilterGroup(
  action: FilterAction,
  group: FilterGroup,
  lhsOptions: LhsOption[],
): FilterGroup {
  if (
    action._type === 'convert.filter.instance.group.to.filter.group.action' &&
    group.contents._type === 'filter.instance.list' &&
    group.contents.id === action.filterInstanceListId
  ) {
    const convertedGroup: FilterGroup = {
      _type: 'filter.group',
      id: uuids.v4(),
      contents: group.contents,
    }
    const newFilterGroupList: FilterGroupList = {
      _type: 'filter.group.list',
      id: uuids.v4(),
      conjunction: 'and',
      groups: [convertedGroup, newEmptyFilterGroup()],
    }
    return { ...group, contents: newFilterGroupList }
  }
  if (group.contents._type === 'filter.group.list') {
    return {
      ...group,
      contents: applyActionToFilterGroupList(action, group.contents, lhsOptions),
    }
  } else {
    return {
      ...group,
      contents: applyActionToFilterInstanceList(action, group.contents, lhsOptions),
    }
  }
}

function newEmptyFilterGroup(): FilterGroup {
  return {
    _type: 'filter.group',
    id: uuids.v4(),
    contents: {
      _type: 'filter.instance.list',
      id: uuids.v4(),
      conjunction: 'and',
      filters: [],
    },
  }
}

function applyActionToFilterGroupList(
  action: FilterAction,
  list: FilterGroupList,
  lhsOptions: LhsOption[],
): FilterGroupList {
  if (action._type === 'add.group.action' && action.filterGroupListId === list.id) {
    return { ...list, groups: [...list.groups, newEmptyFilterGroup()] }
  }
  if (action._type === 'delete.filter.group.action' && action.filterGroupListId === list.id) {
    return { ...list, groups: list.groups.filter((g) => g.id !== action.filterGroupId) }
  }
  if (
    action._type === 'filter.group.list.conjunction.changed.action' &&
    action.filterGroupListId === list.id
  ) {
    return { ...list, conjunction: action.conjunction }
  }
  return {
    ...list,
    groups: list.groups.map((group) => applyActionToFilterGroup(action, group, lhsOptions)),
  }
}

export function partiallyAppliedFilterGroupListReducer(lhsOptions: LhsOption[]) {
  return (action: FilterAction, list: FilterGroupList) =>
    filterGroupListReducer(lhsOptions, action, list)
}

function isConvertingRootFilterInstanceList(list: FilterGroupList) {
  return list.groups.length === 1 && list.groups[0].contents._type === 'filter.instance.list'
}

export function filterGroupListReducer(
  lhsOptions: LhsOption[],
  action: FilterAction,
  list: FilterGroupList,
): FilterGroupList {
  if (
    action._type === 'convert.filter.instance.group.to.filter.group.action' &&
    isConvertingRootFilterInstanceList(list)
  ) {
    return { ...list, groups: [...list.groups, newEmptyFilterGroup()] }
  }
  return applyActionToFilterGroupList(action, list, lhsOptions)
}

export type FilterGroupListReducer = (
  action: FilterAction,
  list: FilterGroupList,
) => FilterGroupList
