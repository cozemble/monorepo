import { FilterOperator } from '@cozemble/data-filters-core'

export interface FilledFilterInstance {
  _type: 'filled.filter.instance'
  dottedIdLhs: string
  rhsValue: any
  operation: FilterOperator
}

export interface FilledFilterInstanceGroup {
  _type: 'filled.filter.instance.group'
  conjunction: 'and' | 'or'
  instances: FilledFilterInstance[]
}
