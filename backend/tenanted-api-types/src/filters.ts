import { FilterOperator } from '@cozemble/data-filters-core'

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
