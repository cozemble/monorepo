<script lang="ts">
import { onMount } from 'svelte'

import {
  registerAllProperties,
  registerAllPropertyConfigurers,
} from '@cozemble/model-assembled'
import ModelEditor from '$lib/ModelEditor.svelte'
import { allModels, bootstrapHost, host } from './host'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { sqlMigrations } from './toSql'
import { registerStringPropertyEventToSqlActions } from '@cozemble/model-string-sql-actions'

let mounted = false
let firstModel: EventSourcedModel | null = null
onMount(() => {
  registerAllProperties()
  registerAllPropertyConfigurers()
  mounted = true
  bootstrapHost(localStorage)
  firstModel = $allModels[0]
})

registerStringPropertyEventToSqlActions()

async function apply() {
  await fetch('http://localhost:3000/api/v1/model/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify($allModels),
  })
}
</script>

{#if mounted && firstModel}
  <ModelEditor modelId={firstModel.model.id} {allModels} {host} />
{/if}
<br />
<button type="button" on:click={apply}>Apply to database</button>
<hr />
<pre>{#each $sqlMigrations as migration}{migration} <br />{/each}</pre>

<!--<pre>events = {JSON.stringify($events, null, 2)}</pre>-->
