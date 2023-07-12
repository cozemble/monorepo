import { objects, uuids } from '@cozemble/lang-util'
import type { StringKeyedObject } from '@cozemble/lang-util'

export interface FilterDataType {
  value: string
}

export interface PostgresComparatorTemplate {
  _type: 'postgres.comparator.template'
  template: string
}

export type LiteralPostgresComparatorValue =
  | '='
  | '<'
  | '<='
  | '>'
  | '>='
  | '!='
  | '<>'
  | 'is null'
  | 'is not null'

export interface LiteralPostgresComparator {
  _type: 'literal.postgres.comparator'
  value: LiteralPostgresComparatorValue
}

export function literalPostgresComparator(
  value: LiteralPostgresComparatorValue,
): LiteralPostgresComparator {
  return { _type: 'literal.postgres.comparator', value }
}

export const postgresComparatorTemplateFns = {
  newInstance: (template: string): PostgresComparatorTemplate => {
    return { _type: 'postgres.comparator.template', template }
  },
  fillValue: (template: PostgresComparatorTemplate, value: string): string => {
    return template.template.replace('{{value}}', value)
  },
}

export type PostgresComparator = LiteralPostgresComparator | PostgresComparatorTemplate

export interface FilterOperator {
  _type: 'filter.operator'
  id: string
  label: string
  postgresComparator: PostgresComparator
  requiresRhs: boolean
}

export const filterOperatorFns = {
  newInstance: (
    id: string,
    label: string,
    postgresComparator: PostgresComparator,
    requiresRhs = true,
  ): FilterOperator => {
    return { _type: 'filter.operator', id, label, postgresComparator, requiresRhs }
  },
}

export interface LhsOption {
  _type: 'lhs.option'
  id: string
  label: string
  dataType: FilterDataType
  operators: FilterOperator[]
  rhsOptions: RhsOptionType[]
}

export function lhsOption(
  id: string,
  label: string,
  dataType: FilterDataType,
  operators: FilterOperator[],
  rhsOptions: RhsOptionType[],
): LhsOption {
  return { _type: 'lhs.option', id, label, dataType, operators, rhsOptions }
}

export interface UserSuppliedRhsOption {
  _type: 'user.supplied.rhs.option'
}

export interface RealWorldRhsOption {
  _type: 'real.world.rhs.option'
}

export function userSuppliedRhsOption(): UserSuppliedRhsOption {
  return { _type: 'user.supplied.rhs.option' }
}

export function realWorldRhsOption(): RealWorldRhsOption {
  return { _type: 'real.world.rhs.option' }
}

export interface IdAndLabel {
  id: string
  label: string
}

export function idAndLabel(id: string, label: string): IdAndLabel {
  return { id, label }
}

export interface SelectableRhsOption {
  _type: 'selectable.rhs.option'
  options: IdAndLabel[]
}

export function selectableRhsOption(options: IdAndLabel[]): SelectableRhsOption {
  return { _type: 'selectable.rhs.option', options }
}

export type RhsOptionType = RealWorldRhsOption | UserSuppliedRhsOption | SelectableRhsOption

export interface UserSuppliedRhsOptionWithValue {
  _type: 'user.supplied.rhs.option.with.value'
  value: any | null
}

export function userSuppliedRhsOptionWithValue(value: any | null): UserSuppliedRhsOptionWithValue {
  return { _type: 'user.supplied.rhs.option.with.value', value }
}

export interface SelectableRhsOptionWithSelection {
  _type: 'selectable.rhs.option.with.selection'
  selection: IdAndLabel | null
}

export function selectableRhsOptionWithSelection(
  selection: IdAndLabel | null,
): SelectableRhsOptionWithSelection {
  return { _type: 'selectable.rhs.option.with.selection', selection }
}

export type SelectedRhsOptionType =
  | UserSuppliedRhsOptionWithValue
  | SelectableRhsOptionWithSelection
  | null

export interface FilterInstance {
  _type: 'filter.instance'
  id: string
  lhsOptions: LhsOption[]
  selectedLhsOption: LhsOption | null
  selectedOperatorOption: FilterOperator | null
  rhsValue: SelectedRhsOptionType
}

export function filterInstance(lhsOptions: LhsOption[]): FilterInstance {
  return {
    _type: 'filter.instance',
    id: uuids.v4(),
    lhsOptions,
    rhsValue: null,
    selectedLhsOption: null,
    selectedOperatorOption: null,
  }
}

function hasRhsFilledIn(instance: FilterInstance): boolean {
  if (instance.rhsValue === null) {
    return false
  }
  if (instance.rhsValue._type === 'user.supplied.rhs.option.with.value') {
    return instance.rhsValue.value !== null
  }
  return instance.rhsValue.selection !== null
}

function fullySpecified(
  lhsOptions: LhsOption[],
  selectedLhsOption: LhsOption,
  selectedOperatorOption: FilterOperator,
  rhsValue: SelectedRhsOptionType,
): FilterInstance {
  const instance: FilterInstance = {
    ...filterInstance(lhsOptions),
    selectedLhsOption,
    selectedOperatorOption,
    rhsValue,
  }
  if (!filterInstanceFns.isFullySpecified(instance)) {
    throw new Error('not fully specified')
  }
  return instance
}

export const filterInstanceFns = {
  newInstance: function (lhsOptions: LhsOption[]): FilterInstance {
    return filterInstance(lhsOptions)
  },
  // @ts-ignore
  getRhsValue: function (instance: FilterInstance, context: StringKeyedObject): any | null {
    if (instance.rhsValue === null) {
      return null
    }
    if (instance.rhsValue._type === 'user.supplied.rhs.option.with.value') {
      return instance.rhsValue.value
    }
    if (instance.rhsValue.selection === null) {
      return null
    }
    return context[instance.rhsValue.selection.id] ?? null
  },
  userSuppliedRhsSelected: function (instance: FilterInstance): boolean {
    return instance.rhsValue?._type === 'user.supplied.rhs.option.with.value'
  },
  selectableRhsSelected: function (instance: FilterInstance): boolean {
    return instance.rhsValue?._type === 'selectable.rhs.option.with.selection'
  },
  isFullySpecified: function (instance: FilterInstance): boolean {
    return (
      instance.selectedLhsOption !== null &&
      instance.selectedOperatorOption !== null &&
      (hasRhsFilledIn(instance) || !instance.selectedOperatorOption.requiresRhs)
    )
  },
  asHash: function (instances: FilterInstance[]): { [key: string]: any } {
    return instances.reduce((acc, instance) => objects.set(acc, instance.id, instance.rhsValue), {})
  },
  fullySpecified,
}

export interface FilterInstanceList {
  _type: 'filter.instance.list'
  id: string
  conjunction: Conjunction
  filters: FilterInstance[]
}

export type Conjunction = 'and' | 'or'

export type FilterGroupContents = FilterInstanceList | FilterGroupList

function emptyFilterInstanceList(filters: FilterInstance[] = []): FilterInstanceList {
  return {
    _type: 'filter.instance.list',
    id: uuids.v4(),
    conjunction: 'and',
    filters,
  }
}

export interface FilterGroup {
  _type: 'filter.group'
  id: string
  contents: FilterGroupContents
}

export interface FilterGroupList {
  _type: 'filter.group.list'
  id: string
  conjunction: Conjunction
  groups: FilterGroup[]
}

function emptyFilterGroupList(contents = emptyFilterInstanceList()): FilterGroupList {
  return {
    _type: 'filter.group.list',
    id: uuids.v4(),
    conjunction: 'and',
    groups: [
      {
        _type: 'filter.group',
        id: uuids.v4(),
        contents,
      },
    ],
  }
}

function flattenFilterGroup(group: FilterGroup): FilterInstance[] {
  if (group.contents._type === 'filter.instance.list') {
    return group.contents.filters
  }
  return group.contents.groups.flatMap(flattenFilterGroup)
}

function flattenFilterGroupList(list: FilterGroupList): FilterInstance[] {
  return list.groups.flatMap(flattenFilterGroup)
}

function fullySpecifiedFilterInstances(list: FilterGroupList): FilterInstance[] {
  return flattenFilterGroupList(list).filter((instance) =>
    filterInstanceFns.isFullySpecified(instance),
  )
}

function allFiltersAreFullySpecified(list: FilterGroupList): boolean {
  return flattenFilterGroupList(list).every((instance) =>
    filterInstanceFns.isFullySpecified(instance),
  )
}

function withFilterInstance(instance: FilterInstance): FilterGroupList {
  return emptyFilterGroupList(filterInstanceListFns.withFilterInstance(instance))
}

export const filterGroupListFns = {
  empty: emptyFilterGroupList,
  flatten: flattenFilterGroupList,
  fullySpecifiedFilterInstances,
  allFiltersAreFullySpecified,
  withFilterInstance,
  hasFilterInstances: function (list: FilterGroupList): boolean {
    return flattenFilterGroupList(list).length > 0
  },
  filterInstanceCount: function (list: FilterGroupList): number {
    return flattenFilterGroupList(list).length
  },
  isEmpty: function (list: FilterGroupList): boolean {
    return !filterGroupListFns.hasFilterInstances(list)
  },
}

export const filterInstanceListFns = {
  empty: emptyFilterInstanceList,
  withFilterInstance: function (instance: FilterInstance): FilterInstanceList {
    return emptyFilterInstanceList([instance])
  },
}
