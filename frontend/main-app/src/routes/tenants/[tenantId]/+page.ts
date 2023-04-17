import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { cozauth } from '../../../lib/auth/cozauth'
import { allModels } from '../../../lib/models/modelsStore'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { tenantStore } from '../../../lib/tenant/tenantStore'
import { tenantEntities } from '../../../lib/models/tenantEntityStore'
import { backend, setBackend } from '../../../lib/backend/backendStore'
import { RestBackend } from '../../../lib/backend/RestBackend'

export const load: PageLoad = async ({ params }) => {
  if (browser) {
    try {
      setBackend(new RestBackend())
      const tenantData = await backend.getTenantDetails(params.tenantId)
      allModels.set(tenantData.models.map((m) => eventSourcedModelFns.newInstance(m)))
      tenantEntities.set(tenantData.entities)
      tenantStore.set({ _type: 'tenant', id: params.tenantId, name: tenantData.name })
    } catch (e) {
      console.error(e)
      cozauth.clearTokens(cozauth.getTenantRoot(params.tenantId))
      window.location.href = '/'
    }
  }
}
