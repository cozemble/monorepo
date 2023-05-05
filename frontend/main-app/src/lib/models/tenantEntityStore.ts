import { uuids } from '@cozemble/lang-util'
import type { ModelId, ModelView, ModelViewId, SystemConfiguration } from '@cozemble/model-core'
import { slotSystemConfigurationDescriptors, systemConfigurationFns } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { derived, writable } from 'svelte/store'
import { backend } from '../backend/backendStore'

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
export const systemConfiguration = derived(tenantEntities, getSystemConfiguration)

function getSystemConfiguration(entities: TenantEntity[]): SystemConfiguration {
  return ensureDefaultSystemConfiguration(
    (entities.find((e) => e._type === 'system.configuration') as SystemConfiguration) ??
      systemConfigurationFns.empty(),
  )
}

export function mergeTenantEntities(entities: TenantEntity[]) {
  tenantEntities.update((existing) => {
    const newEntities = entities.filter((e) => !existing.find((e2) => e2.id.value === e.id.value))
    const changed = existing.map((entity) => {
      const newEntity = newEntities.find((e) => e.id.value === entity.id.value)
      if (newEntity) {
        return newEntity
      }
      return entity
    })
    return [...changed, ...newEntities]
  })
}

export async function saveSystemConfiguration(
  tenantId: string,
  systemConfiguration: SystemConfiguration,
) {
  await saveEntities(tenantId, [systemConfiguration])
  tenantEntities.update((entities) => {
    return entities.map((entity) => {
      if (entity._type === 'system.configuration') {
        return systemConfiguration
      }
      return entity
    })
  })
}

function ensureDefaultSystemConfiguration(
  systemConfiguration: SystemConfiguration,
): SystemConfiguration {
  const slots = slotSystemConfigurationDescriptors.list()
  for (const slot of slots) {
    const defaultValues = slot.defaultValues()
    if (!systemConfiguration.slotConfiguration[slot.slotType]) {
      systemConfiguration.slotConfiguration[slot.slotType] = {
        _type: 'slot.configuration',
        slotType: slot.slotType,
        configuration: defaultValues,
      }
    }
  }
  return systemConfiguration
}

async function saveEntities(tenantId: string, entities: TenantEntity[]) {
  return backend.saveEntities(tenantId, entities)
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
