import { uuids } from '@cozemble/lang-util'
import type { ModelId, ModelView, ModelViewId } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { derived, writable } from 'svelte/store'
import { cozauth } from '../auth/cozauth'
import { config } from '../config'

export interface TenantEntity {
  _type: string
  id: { value: string }
  name: { value: string }
}

export const tenantEntities: Writable<TenantEntity[]> = writable([])
export const modelViews = derived(
  tenantEntities,
  (entities) => entities.filter((e) => e._type === 'model.view') as ModelView[],
)

async function saveEntities(tenantId: string, entities: TenantEntity[]) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  const result = await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}/entity`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(entities),
  })
  if (!result.ok) {
    throw new Error(`Failed to save entities: ${result.statusText}`)
  }
}

function createSummaryView(viewId: ModelViewId, modelId: ModelId, template: string) {
  const newSummaryView: ModelView = {
    _type: 'model.view',
    id: viewId,
    name: { value: 'Summary View', _type: 'model.view.name' },
    modelId,
    view: {
      _type: 'summary.view',
      view: {
        _type: 'model.html.template',
        template,
      },
    },
  }
  return newSummaryView
}

export async function putEditedSummaryView(
  tenantId: string,
  modelId: ModelId,
  viewId: ModelViewId,
  template: string,
) {
  const newSummaryView = createSummaryView(viewId, modelId, template)
  await saveEntities(tenantId, [newSummaryView])
  tenantEntities.update((entities) =>
    entities.map((entity) => (entity.id.value === viewId.value ? newSummaryView : entity)),
  )
}

export async function putNewSummaryView(tenantId: string, modelId: ModelId, template: string) {
  const newSummaryView = createSummaryView(
    { value: uuids.v4(), _type: 'model.view.id' },
    modelId,
    template,
  )
  await saveEntities(tenantId, [newSummaryView])
  tenantEntities.update((entities) => [...entities, newSummaryView])
}
