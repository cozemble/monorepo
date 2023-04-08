import type { Model, ModelPath, ModelPathElement } from '@cozemble/model-core'
import { modelFns } from '@cozemble/model-api'
import { filterOperations } from '@cozemble/backend-filtering-core'

export function getFilterablePaths(models: Model[], model: Model): ModelPath<ModelPathElement>[] {
  return modelFns.allPaths(models, model).filter((path) => {
    const lastElement = path.lastElement
    return (
      lastElement._type === 'property' &&
      filterOperations.get(lastElement.propertyType.value) !== null
    )
  })
}
