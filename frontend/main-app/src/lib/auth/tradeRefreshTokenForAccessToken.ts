import { config } from '$lib/config'

export async function tradeRefreshTokenForAccessToken(
  userPool: string,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch(`${config.backendUrl()}/api/v1/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) {
    throw new Error(`Failed to trade refresh token for access token. Status: ${response.status}`)
  }
  return await response.json()
}
