import { withAccessToken } from './jwt'
import { withAdminPgClient } from './postgresPool'
import { withClaimInPgSession } from './withClaimInPgSession'
import express from 'express'
import pg from 'pg'

export async function authenticatedDatabaseRequest(
  req: express.Request,
  res: express.Response,
  f: (client: pg.PoolClient) => Promise<any>,
) {
  return withAccessToken(req, res, async (claim) => {
    return withAdminPgClient(async (client) => {
      await withClaimInPgSession(client, claim, async () => {
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
