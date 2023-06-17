import type { ModelView, SystemConfiguration } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
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
  return (
    (entities.find((e) => e._type === 'system.configuration') as SystemConfiguration) ??
    systemConfigurationFns.empty()
  )
}

export function mergeTenantEntities(entities: TenantEntity[]) {
  console.warn(new Error('mergeTenantEntities'))
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

async function saveEntities(tenantId: string, entities: TenantEntity[]) {
  return backend.saveEntities(tenantId, entities)
}
