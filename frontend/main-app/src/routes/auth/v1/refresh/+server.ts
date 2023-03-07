import type { RequestEvent } from '@sveltejs/kit'
import { withAdminPgClient } from '../../github/callback/postgresClient'
import { db } from '../../../../lib/backend/db'
import { newSessionTokens } from '../../github/callback/establishSession'

export async function POST(event: RequestEvent) {
  const body = await event.request.json()
  const givenRefreshToken = body.refreshToken
  if (!givenRefreshToken) {
    return new Response(`No refresh token provided`, { status: 400 })
  }
  return withAdminPgClient(async (client) => {
    return db.inTxn(client, async () => {
      const user = await db.refreshTokens.tradeRefreshTokenForUser(client, givenRefreshToken)
      if (!user) {
        return new Response(`Invalid refresh token`, { status: 401 })
      }
      const [accessToken, refreshToken] = await newSessionTokens(client, user, user.user_pool)
      return new Response(JSON.stringify({ accessToken, refreshToken }), {
        status: 200,
      })
    })
  })
}
