import { withAccessToken } from './jwt.js'
import { withAdminPgClient } from './postgresPool.js'
import { withClaimInPgSession } from './withClaimInPgSession.js'
import express from 'express'
import pg from 'pg'

export async function authenticatedDatabaseRequest(
  req: express.Request,
  res: express.Response,
  f: (client: pg.PoolClient) => Promise<any>,
) {
  return withAccessToken(req, res, async (claim) => {
    return withAdminPgClient(async (client) => {
      return withClaimInPgSession(client, claim, async () => {
        try {
          return await f(client)
        } catch (e: any) {
          console.error(e)
          if (e.code === '42501') {
            return res.status(403).send()
          }
          return res.status(500).send()
        }
      })
    })
  })
}
