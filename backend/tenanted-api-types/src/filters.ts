import {
  afterFilterOperator,
  equalsFilterOperator,
  FilterOperator,
} from '@cozemble/data-filters-core'

export interface Value {
  _type: 'value'
  value: any
}

export type RhsValue = Value

export interface FilledFilterInstance {
  _type: 'filled.filter.instance'
  dottedIdLhs: string
  rhsValue: RhsValue | null
  operation: FilterOperator
}

export interface FilledFilterInstanceGroup {
  _type: 'filled.filter.instance.group'
  conjunction: 'and' | 'or'
  instances: FilledFilterInstance[]
}

export interface FilterRequestPayload {
  _type: 'filter.request.payload'
  query: string | null
  filter: FilledFilterInstanceGroup | null
  limit: number
  offset: number
}

export const filledFilterInstanceGroupFns = {
  where: (lhs: string, operation: FilterOperator, rhs: any): FilledFilterInstanceGroup => ({
    _type: 'filled.filter.instance.group',
    conjunction: 'and',
    instances: [
      {
        _type: 'filled.filter.instance',
        dottedIdLhs: lhs,
        rhsValue: { _type: 'value', value: rhs },
        operation,
      },
    ],
  }),
  whereLhsEqRhs: (lhs: string, rhs: any): FilledFilterInstanceGroup => {
    return filledFilterInstanceGroupFns.where(lhs, equalsFilterOperator, rhs)
  },
  whereLhsIsAfterRhs: (lhs: string, rhs: any): FilledFilterInstanceGroup => {
    return filledFilterInstanceGroupFns.where(lhs, afterFilterOperator, rhs)
  },
}
export const filterRequestPayloadFns = {
  newInstance: (
    query: string | null,
    filter: FilledFilterInstanceGroup | null,
    limit = 10,
    offset = 0,
  ): FilterRequestPayload => ({
    _type: 'filter.request.payload',
    query,
    filter,
    limit,
    offset,
  }),
}
