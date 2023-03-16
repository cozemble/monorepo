import type { Model, ModelEvent } from '@cozemble/model-core'
import { config } from '../../../lib/config'
import type { TenantEntity } from '../../../lib/models/tenantEntityStore'

export interface FetchTenantResponse {
  id: string
  name: string
  models: Model[]
  events: ModelEvent[]
  entities: TenantEntity[]
}

export async function fetchTenant(
  tenantId: string,
  accessToken: string,
): Promise<FetchTenantResponse> {
  const response = await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (response.ok) {
    return response.json()
  }
  throw new Error(`Failed to fetch tenant ${tenantId}: ${response.status} ${response.statusText}`)
}
