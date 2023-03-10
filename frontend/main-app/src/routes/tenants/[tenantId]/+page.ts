import type { PageLoad } from './$types'
import { fetchTenant } from './fetchTenant'
import { browser } from '$app/environment'
import { cozauth } from '../../../lib/auth/cozauth'
import { allModels } from '../../../lib/models/modelsStore'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { tenantStore } from '../../../lib/tenant/tenantStore'

export const load: PageLoad = async ({ params }) => {
  if (browser) {
    const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(params.tenantId))
    if (!accessToken) {
      throw new Error(`No access token for tenant ${params.tenantId}`)
    }
    const tenantData = await fetchTenant(params.tenantId, accessToken)
    allModels.set(tenantData.models.map((m) => eventSourcedModelFns.newInstance(m)))
    tenantStore.set({ _type: 'tenant', id: params.tenantId, name: tenantData.name })
  }
}
