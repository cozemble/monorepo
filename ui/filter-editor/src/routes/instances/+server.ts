import type {
  FilterInstance,
  FilterGroup,
  FilterGroupList,
  FilterInstanceList,
  LhsOption,
} from '@cozemble/data-filters'
import { lhsOption } from '@cozemble/data-filters'
import { dateFilterType } from '@cozemble/data-filters'
import { userSuppliedRhsOption } from '@cozemble/data-filters'
import { selectableRhsOption } from '@cozemble/data-filters'
import { userSuppliedRhsOptionWithValue } from '@cozemble/data-filters'
import { realWorldRhsOption } from '@cozemble/data-filters'
import { idAndLabel } from '@cozemble/data-filters'
import { filterOperatorFns } from '@cozemble/data-filters'
import { uuids } from '@cozemble/lang-util'

const equalsOperator = filterOperatorFns.newInstance('equals', 'equals')
const beforeOperator = filterOperatorFns.newInstance('before', 'is before')
const containsOperator = filterOperatorFns.newInstance('contains', 'contains')
const isNullOperator = filterOperatorFns.newInstance('is null', 'is null', false)
const dateOperators = [
  equalsOperator,
  beforeOperator,
  filterOperatorFns.newInstance('after', '>'),
  isNullOperator,
]
const stringOperators = [
  equalsOperator,
  containsOperator,
  filterOperatorFns.newInstance('like', 'like'),
  isNullOperator,
]

const date1LhsOption = lhsOption('date#1', 'Date 1', dateFilterType(), dateOperators, [
  userSuppliedRhsOption(),
])
const date2LhsOption = lhsOption('date#2', 'Date 2', dateFilterType(), dateOperators, [
  realWorldRhsOption(),
  userSuppliedRhsOption(),
  selectableRhsOption([idAndLabel('from', 'From Date'), idAndLabel('to', 'To Date')]),
])
const date3LhsOption = lhsOption('date#3', 'Date 3', dateFilterType(), dateOperators, [
  userSuppliedRhsOption(),
])
const ownerLhsOption = lhsOption('owner#4', 'Owner', { _type: 'string' }, stringOperators, [
  userSuppliedRhsOption(),
  selectableRhsOption([idAndLabel('firstName', 'First name'), idAndLabel('lastName', 'Last name')]),
])
const nameLhsOption = lhsOption('name#5', 'Name', { _type: 'string' }, stringOperators, [
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
  selectedOperatorOption: equalsOperator,
}

export const date2BeforeToday: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue(new Date()),
  selectedLhsOption: date2LhsOption,
  selectedOperatorOption: beforeOperator,
}

export const date3InNull: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: null,
  selectedLhsOption: date3LhsOption,
  selectedOperatorOption: isNullOperator,
}

export const ownerContainsMike: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue('Mike'),
  selectedLhsOption: ownerLhsOption,
  selectedOperatorOption: containsOperator,
}

export const nameEqualsFred: FilterInstance = {
  _type: 'filter.instance',
  id: uuids.v4(),
  lhsOptions,
  rhsValue: userSuppliedRhsOptionWithValue('Fred'),
  selectedLhsOption: nameLhsOption,
  selectedOperatorOption: equalsOperator,
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
