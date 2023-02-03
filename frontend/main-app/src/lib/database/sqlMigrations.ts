import { actionToSql, schema } from '@cozemble/sql-actions'
import { sqlActionsPlayer } from '@cozemble/model-sql-actions-player'
import { allModels } from '../models/host'
import { derived, writable } from 'svelte/store'

export const theSchema = writable(schema('public'))

export const sqlMigrations = derived([allModels, theSchema], ([models, theSchema]) => {
  return sqlActionsPlayer
    .play(models)
    .map((a) => actionToSql(theSchema, a))
    .flatMap((m) => m.up)
})
