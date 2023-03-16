import type { TenantEntity } from './tenantEntityStore'
import type { ModelId, ModelView } from '@cozemble/model-core'

export function getSummaryView(modelId: ModelId, entities: TenantEntity[]): ModelView | null {
  const modelViews = entities.filter((e) => e._type === 'model.view') as ModelView[]
  return (
    (modelViews.find(
      (e) => e.modelId.value === modelId.value && e.name.value === 'Summary View',
    ) as ModelView) ?? null
  )
}
