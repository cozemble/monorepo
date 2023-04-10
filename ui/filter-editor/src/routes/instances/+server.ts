import type {
  FilterGroup,
  FilterGroupList,
  FilterInstance,
  FilterInstanceList,
  LhsOption,
} from '@cozemble/data-filters-core'
import {
  afterFilterOperator,
  beforeFilterOperator,
  containsFilterOperator,
  equalsFilterOperator,
  idAndLabel,
  isNullFilterOperator,
  lhsOption,
  realWorldRhsOption,
  selectableRhsOption,
  userSuppliedRhsOption,
  userSuppliedRhsOptionWithValue,
} from '@cozemble/data-filters-core'
import { uuids } from '@cozemble/lang-util'

const dateOperators = [
  equalsFilterOperator,
  beforeFilterOperator,
  afterFilterOperator,
  isNullFilterOperator,
]
const stringOperators = [equalsFilterOperator, containsFilterOperator, isNullFilterOperator]

const date1LhsOption = lhsOption('date#1', 'Date 1', { value: 'date' }, dateOperators, [
  userSuppliedRhsOption(),
])
const date2LhsOption = lhsOption('date#2', 'Date 2', { value: 'date' }, dateOperators, [
  realWorldRhsOption(),
  userSuppliedRhsOption(),
  selectableRhsOption([idAndLabel('from', 'From Date'), idAndLabel('to', 'To Date')]),
])
const date3LhsOption = lhsOption('date#3', 'Date 3', { value: 'date' }, dateOperators, [
  userSuppliedRhsOption(),
])
const ownerLhsOption = lhsOption('owner#4', 'Owner', { value: 'string' }, stringOperators, [
  userSuppliedRhsOption(),
  selectableRhsOption([idAndLabel('firstName', 'First name'), idAndLabel('lastName', 'Last name')]),
])
const nameLhsOption = lhsOption('name#5', 'Name', { value: 'string' }, stringOperators, [
  userSuppliedRhsOption(),
])

export const sampleLhsOptions: LhsOption[] = [
  date1LhsOption,
  date2LhsOption,
  date3LhsOption,
  ownerLhsOption,
  nameLhsOption,
]

const lhsOptions = sampleLhsOptions
// const operatorOptions = ["equals", "contains", "before", "is null"]

export const date1EqualsToday: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue(new Date()),
  selectedLhsOption: date1LhsOption,
  selectedOperatorOption: equalsFilterOperator,
}

export const date2BeforeToday: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue(new Date()),
  selectedLhsOption: date2LhsOption,
  selectedOperatorOption: beforeFilterOperator,
}

export const date3InNull: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: null,
  selectedLhsOption: date3LhsOption,
  selectedOperatorOption: isNullFilterOperator,
}

export const ownerContainsMike: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue('Mike'),
  selectedLhsOption: ownerLhsOption,
  selectedOperatorOption: containsFilterOperator,
}

export const nameEqualsFred: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue('Fred'),
  selectedLhsOption: nameLhsOption,
  selectedOperatorOption: equalsFilterOperator,
}

export const group1List: FilterInstanceList = {
  _type: 'filter.instance.list',
  id: uuids.v4(),
  conjunction: 'and',
  filters: [date1EqualsToday],
}

export const group1: FilterGroup = {
  _type: 'filter.group',
  id: uuids.v4(),
  contents: group1List,
}

export const group2_1List: FilterInstanceList = {
  _type: 'filter.instance.list',
  id: uuids.v4(),
  conjunction: 'or',
  filters: [date1EqualsToday, date2BeforeToday, nameEqualsFred],
}

export const group2_1: FilterGroup = {
  _type: 'filter.group',
  id: uuids.v4(),
  contents: group2_1List,
}

export const group2_2List: FilterInstanceList = {
  _type: 'filter.instance.list',
  id: uuids.v4(),
  conjunction: 'or',
  filters: [date3InNull, ownerContainsMike],
}
export const group2_2: FilterGroup = {
  _type: 'filter.group',
  id: uuids.v4(),
  contents: group2_2List,
}

export const group2Contents: FilterGroupList = {
  _type: 'filter.group.list',
  id: uuids.v4(),
  conjunction: 'and',
  groups: [group2_1, group2_2],
}

export const group2: FilterGroup = {
  _type: 'filter.group',
  id: uuids.v4(),
  contents: group2Contents,
}

export const emptyFilterInstanceList: FilterInstanceList = {
  _type: 'filter.instance.list',
  id: uuids.v4(),
  conjunction: 'and',
  filters: [],
}

export const emptyFilterGroup: FilterGroup = {
  _type: 'filter.group',
  id: uuids.v4(),
  contents: emptyFilterInstanceList,
}

export const rootGroupList: FilterGroupList = {
  _type: 'filter.group.list',
  id: uuids.v4(),
  conjunction: 'and',
  groups: [emptyFilterGroup],
  // groups: [group1]
  // groups: [group1, group2]
}
