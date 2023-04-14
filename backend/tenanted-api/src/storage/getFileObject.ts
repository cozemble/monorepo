import express from 'express'
import pg from 'pg'
import { mandatory } from '@cozemble/lang-util'

export async function getFileObject(
  req: express.Request,
  res: express.Response,
  client: pg.PoolClient,
): Promise<any | null> {
  const { tenantId, fileId } = req.params
  const getObjectResponse = await client.query(
    `SELECT get_object_as_json( $1, $2, $3 ) as object;`,
    [mandatory(req.env, `No env in request`), tenantId, fileId],
  )

  if (getObjectResponse.rows.length === 0 || getObjectResponse.rows[0].object === null) {
    return res.status(404).send()
  }
  return getObjectResponse.rows[0].object
}
