import type { Model } from '@cozemble/model-core'
import { reconfigureApp } from '$lib/generative/components/helpers'
import { collapseRecordAdditionRow, expandRecordAdditionRow } from '$lib/generative/autoExpander'
import { tick } from 'svelte'

export async function applyAmendment(converted: { model: Model; allModels: Model[] }) {
  collapseRecordAdditionRow()
  await tick()
  reconfigureApp(converted)
  await tick()
  setTimeout(expandRecordAdditionRow, 5)
}
