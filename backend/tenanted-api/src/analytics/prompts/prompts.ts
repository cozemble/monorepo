import { Request, Response, Router } from 'express'
import { withAdminPgClient } from '../../infra/postgresPool.js'

const router: Router = Router()

router.post('/prompt-event', async (req: Request, res: Response) => {
  const data = req.body
  try {
    if (!data) {
      return res.status(400).send(`No data provided`)
    }
    if (!data.sessionId) {
      return res.status(400).send(`No sessionId provided`)
    }
    if (!data.promptEvent) {
      return res.status(400).send(`No promptEvent provided`)
    }
    const { sessionId, promptEvent } = data
    return await withAdminPgClient(async (client) => {
      const result = await client.query(
        'select * from insert_prompt_event($1, $2, $3, $4, $5, $6, $7, $8, $9) as inserted;',
        [
          promptEvent.promptType,
          promptEvent.userPromptText,
          promptEvent.issuedPrompt,
          promptEvent.responseText,
          promptEvent.promptTemplateId,
          promptEvent.error,
          promptEvent.submitTimestamp,
          promptEvent.responseTimestamp,
          sessionId,
        ],
      )
      if (result.rows.length === 0 || result.rows[0].inserted === null) {
        return res.status(404).send()
      }
      return res.status(200).send()
    })
  } catch (e) {
    console.error(`When handling prompt event`, e)
    return res.status(500).send()
  }
})

export default router
