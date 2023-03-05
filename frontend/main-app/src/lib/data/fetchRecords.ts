import { config } from '../config'

function convertToPgQuery(s: string) {
  return encodeURIComponent(
    s
      .split(' ')
      .map((s) => `${s}:*`)
      .join(' & '),
  )
}

export async function fetchRecords(
  tenantId: string,
  modelId: string,
  accessToken: string,
  search: string | null = null,
) {
  const q = search ? `?q=${convertToPgQuery(search)}` : ''
  return await fetch(
    `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record${q}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
}
