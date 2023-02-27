import { config } from '../../../../../lib/config'

export async function fetchInitialRecords(tenantId: string, modelId: string, accessToken: string) {
  return await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
