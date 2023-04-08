import { FilterOperator } from '@cozemble/data-filters'

const filterOperationMap: Map<string, FilterOperator[]> = new Map()

export const filterOperations = {
  register: (key: string, filterOperations: FilterOperator[]) => {
    filterOperationMap.set(key, filterOperations)
  },
  get: (key: string): FilterOperator[] | null => {
    return filterOperationMap.get(key) ?? null
  },
  listKeys: (): string[] => {
    return Array.from(filterOperationMap.keys())
  },
}
