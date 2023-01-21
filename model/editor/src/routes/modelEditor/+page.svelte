<script lang="ts">
import { onMount } from 'svelte'

import {
  registerAllProperties,
  registerAllPropertyConfigurers,
} from '@cozemble/model-assembled'
import ModelEditor from '$lib/ModelEditor.svelte'
import { allModels, bootstrapHost, host, clearLocalStorage } from './host'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { events, eventTypes, sqlMigrations } from './toSql'
import { registerStringPropertyEventToSqlActions } from '@cozemble/model-string-sql-actions'

let mounted = false
let firstModel: EventSourcedModel | null = null
let eventIndexToShow: number | null = null
let modelIndexToShow: number | null = null
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

function showEvent(index: number) {
  eventIndexToShow = index
}

function showModel(index: number) {
  modelIndexToShow = index
}

function clearClicked() {
  clearLocalStorage(localStorage)
  firstModel = $allModels[0]
}
</script>

{#if mounted && firstModel}
  <ModelEditor modelId={firstModel.model.id} {allModels} {host} />
{/if}
<hr />
<pre>{#each $sqlMigrations as migration}{migration} <br />{/each}</pre>
<br />
<button type="button" on:click={apply}>Apply to database</button>
<hr />
<br />
<div class="inspector">
  <div class="events-inspector">
    <div class="event-types">
      <h5>Event types</h5>
      {#each $eventTypes as eventType, index}
        <a href="#!" class="event-type" on:click={() => showEvent(index)}
          >{index}. {eventType}</a
        ><br />
      {/each}
    </div>
    {#if eventIndexToShow !== null}
      <div class="event-type">
        <h5>Event {eventIndexToShow}</h5>
        <pre>{JSON.stringify($events[eventIndexToShow].event, null, 2)}</pre>
      </div>
    {/if}
  </div>
  <div class="models-inspector">
    <h5>Models</h5>
    {#each $allModels as model, index}
      <a href="#!" class="model-name" on:click={() => showModel(index)}
        >{index}. {model.model.name.value}</a
      ><br />
    {/each}
    {#if modelIndexToShow !== null}
      {@const model = $allModels[modelIndexToShow]}
      <div class="model-type">
        <h5>Showing model {model.model.name.value}</h5>
        <pre>{JSON.stringify($allModels[modelIndexToShow].model, null, 2)}</pre>
      </div>
    {/if}
  </div>
</div>
<div class="controls">
  <button type="button" on:click={clearClicked}>Clear</button>
</div>

<style>
.inspector {
  display: flex;
  flex-direction: row;
}

.events-inspector {
  margin-right: 1rem;
}

.controls {
  margin-top: 1rem;
}
</style>
