import type { Model, ModelPath, ModelPathElement } from '@cozemble/model-core'
import { modelFns, modelPathFns } from '@cozemble/model-api'
import { filterOperations } from '@cozemble/data-filters-config'
import type { LhsOption } from '@cozemble/data-filters-core'
import { lhsOption, userSuppliedRhsOption } from '@cozemble/data-filters-core'
import { uuids } from '@cozemble/lang-util'

export function getFilterablePaths(models: Model[], model: Model): ModelPath<ModelPathElement>[] {
  return modelFns.allPaths(models, model).filter((path) => {
    const lastElement = path.lastElement
    return (
      lastElement._type === 'property' && filterOperations.get(lastElement.propertyType) !== null
    )
  })
}

export function getFilterLhsOptionsForModel(models: Model[], model: Model): LhsOption[] {
  return getFilterablePaths(models, model).flatMap((path) => {
    const lastElement = path.lastElement
    if (lastElement._type === 'property') {
      const filterOperation = filterOperations.get(lastElement.propertyType)
      if (filterOperation !== null) {
        return [
          lhsOption(
            uuids.v4(),
            modelPathFns.toDottedNamePath(path).value,
            lastElement.propertyType,
            filterOperation,
            [userSuppliedRhsOption()],
          ),
        ]
      }
    }
    return []
  })
}
