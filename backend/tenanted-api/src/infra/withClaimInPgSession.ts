import { JwtClaim } from './jwt'
import pg from 'pg'

export async function withClaimInPgSession<T>(
  client: pg.PoolClient,
  claim: JwtClaim,
  f: () => Promise<T>,
) {
  try {
    await client.query(`SET jwt.claim.sub = '${claim.sub}';`)
    return f()
  } finally {
    await client.query(`SET jwt.claim.sub = '';`)
  }
}
