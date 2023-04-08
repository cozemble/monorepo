import type { Conjunction, IdAndLabel } from './types'

export interface NewFilterInstanceAction {
  _type: 'new.filter.instance.action'
  filterInstanceListId: string
}

function newFilterInstance(filterInstanceListId: string): NewFilterInstanceAction {
  return { _type: 'new.filter.instance.action', filterInstanceListId }
}

export interface LhsChangedAction {
  _type: 'lhs.changed.action'
  filterInstanceId: string
  lhsOptionId: string
}

function lhsChanged(filterInstanceId: string, lhsOptionId: string): LhsChangedAction {
  return { _type: 'lhs.changed.action', filterInstanceId, lhsOptionId }
}

export interface OperatorChangedAction {
  _type: 'operator.changed.action'
  filterInstanceId: string
  operatorOptionId: string
}

function operatorChanged(
  filterInstanceId: string,
  operatorOptionId: string,
): OperatorChangedAction {
  return { _type: 'operator.changed.action', filterInstanceId, operatorOptionId }
}

export interface RhsChangedAction {
  _type: 'rhs.changed.action'
  filterInstanceId: string
  rhsValue: any | null
}

function rhsChanged(filterInstanceId: string, rhsValue: any | null): RhsChangedAction {
  return { _type: 'rhs.changed.action', filterInstanceId, rhsValue }
}

export interface AddGroupAction {
  _type: 'add.group.action'
  filterGroupListId: string
}

function addGroup(filterGroupListId: string): AddGroupAction {
  return { _type: 'add.group.action', filterGroupListId }
}

export interface ConvertFilterInstanceGroupToFilterGroupAction {
  _type: 'convert.filter.instance.group.to.filter.group.action'
  filterInstanceListId: string
}

function convertFilterInstanceGroupToFilterGroup(
  filterInstanceListId: string,
): ConvertFilterInstanceGroupToFilterGroupAction {
  return { _type: 'convert.filter.instance.group.to.filter.group.action', filterInstanceListId }
}

export interface FilterInstanceConjunctionChangedAction {
  _type: 'filter.instance.list.conjunction.changed.action'
  filterInstanceListId: string
  conjunction: Conjunction
}

function filterInstanceListConjunctionChanged(
  filterInstanceListId: string,
  conjunction: Conjunction,
): FilterInstanceConjunctionChangedAction {
  return {
    _type: 'filter.instance.list.conjunction.changed.action',
    filterInstanceListId,
    conjunction,
  }
}

export interface FilterGroupListConjunctionChangedAction {
  _type: 'filter.group.list.conjunction.changed.action'
  filterGroupListId: string
  conjunction: Conjunction
}

function filterGroupListConjunctionChanged(
  filterGroupListId: string,
  conjunction: Conjunction,
): FilterGroupListConjunctionChangedAction {
  return { _type: 'filter.group.list.conjunction.changed.action', filterGroupListId, conjunction }
}

export interface DeleteFilterInstanceAction {
  _type: 'delete.filter.instance.action'
  filterInstanceListId: string
  filterInstanceId: string
}

function deleteFilterInstance(
  filterInstanceListId: string,
  filterInstanceId: string,
): DeleteFilterInstanceAction {
  return { _type: 'delete.filter.instance.action', filterInstanceListId, filterInstanceId }
}

export interface DeleteFilterGroupAction {
  _type: 'delete.filter.group.action'
  filterGroupListId: string
  filterGroupId: string
}

function deleteFilterGroup(
  filterGroupListId: string,
  filterGroupId: string,
): DeleteFilterGroupAction {
  return { _type: 'delete.filter.group.action', filterGroupListId, filterGroupId }
}

export interface RhsOptionTypeChangedAction {
  _type: 'rhs.option.type.changed.action'
  filterInstanceId: string
  selectedRhsOption: IdAndLabel
}

function rhsOptionTypeChanged(
  filterInstanceId: string,
  selectedRhsOption: IdAndLabel,
): RhsOptionTypeChangedAction {
  return { _type: 'rhs.option.type.changed.action', filterInstanceId, selectedRhsOption }
}

export type FilterAction =
  | NewFilterInstanceAction
  | LhsChangedAction
  | OperatorChangedAction
  | RhsChangedAction
  | AddGroupAction
  | ConvertFilterInstanceGroupToFilterGroupAction
  | FilterInstanceConjunctionChangedAction
  | FilterGroupListConjunctionChangedAction
  | DeleteFilterInstanceAction
  | DeleteFilterGroupAction
  | RhsOptionTypeChangedAction

export type FilterActionHandler = (action: FilterAction) => void

export const filterActions = {
  newFilterInstance,
  lhsChanged,
  operatorChanged,
  rhsChanged,
  addGroup,
  convertFilterInstanceGroupToFilterGroup,
  filterInstanceListConjunctionChanged,
  filterGroupListConjunctionChanged,
  deleteFilterInstance,
  deleteFilterGroup,
  rhsOptionTypeChanged,
}
