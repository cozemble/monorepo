import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { cozauth } from '../../../lib/auth/cozauth'
import { eventSourcedModels } from '../../../lib/models/modelsStore'
import { eventSourcedModelFns, eventSourcedModelListFns } from '@cozemble/model-event-sourced'
import { tenantStore } from '../../../lib/tenant/tenantStore'
import { tenantEntities } from '../../../lib/models/tenantEntityStore'
import { backend, setBackend } from '../../../lib/backend/backendStore'
import { LocalStorageBackend, RestBackend } from '@cozemble/frontend-bff'
import { accessTokenProvider, backendUrlProvider } from '../../../lib/backend/adapters'
import { eventSourcedModels as incrementalEventSourcedModels } from '../../../lib/incrementalModelling/incrementalModelStore'

export const load: PageLoad = async ({ params, url }) => {
  if (browser) {
    try {
      if (url.searchParams.get('backend') === 'localstorage') {
        console.log('Using localstorage backend')
        setBackend(new LocalStorageBackend())
      } else {
        console.log('Using rest backend')
        setBackend(new RestBackend(accessTokenProvider, backendUrlProvider))
      }
      const tenantData = await backend.getTenantDetails(params.tenantId)
      eventSourcedModels.set(tenantData.models.map((m: any) => eventSourcedModelFns.newInstance(m)))
      incrementalEventSourcedModels.set(
        eventSourcedModelListFns.newInstance(
          tenantData.models.map((m: any) => eventSourcedModelFns.newInstance(m)),
        ),
      )
      console.log('tenantData', tenantData)
      tenantEntities.set(tenantData.entities)
      tenantStore.set({ _type: 'tenant', id: params.tenantId, name: tenantData.name })
    } catch (e) {
      console.error(e)
      cozauth.clearTokens(cozauth.getTenantRoot(params.tenantId))
      window.location.href = '/'
    }
  }
}
