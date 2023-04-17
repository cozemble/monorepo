import { config } from '../config'
import {
  filledFilterInstanceGroupFns,
  filterRequestPayloadFns,
} from '@cozemble/backend-tenanted-api-types'

export async function fetchRecords(
  tenantId: string,
  modelId: string,
  accessToken: string,
  search: string | null = null,
  filters = filledFilterInstanceGroupFns.empty(),
) {
  return await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(filterRequestPayloadFns.newInstance(search, filters)),
  })
}
