import { JwtClaim } from './jwt.ts'
import pg from 'pg'
import { inTxn } from './postgresPool.ts'

export async function withClaimInPgSession<T>(
  client: pg.PoolClient,
  claim: JwtClaim,
  f: () => Promise<T>,
) {
  return inTxn(client, async () => {
    await client.query(`SET LOCAL jwt.claim.sub = '${claim.sub}';`)
    return f()
  })
}
