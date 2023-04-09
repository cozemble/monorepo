import { FilterDataType, FilterOperator } from '@cozemble/data-filters-core'

const filterOperationMap: Map<string, FilterOperator[]> = new Map()
export type ComponentAndProps = { component: any; props: any }
const filterValueProviderMap: Map<string, ComponentAndProps> = new Map()

export const filterOperations = {
  register: (key: FilterDataType, filterOperations: FilterOperator[]) => {
    filterOperationMap.set(key.value, filterOperations)
  },
  get: (key: FilterDataType): FilterOperator[] | null => {
    return filterOperationMap.get(key.value) ?? null
  },
  listKeys: (): FilterDataType[] => {
    return Array.from(filterOperationMap.keys()).map((key) => ({ value: key }))
  },
}

export const filterValueProviders = {
  register: (key: FilterDataType, valueProvider: ComponentAndProps) => {
    filterValueProviderMap.set(key.value, valueProvider)
  },
  get: (key: FilterDataType): ComponentAndProps | null => {
    return filterValueProviderMap.get(key.value) ?? null
  },
}
