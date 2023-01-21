<script lang="ts">
import type { RecordEditContext } from '$lib/RecordEditContext'
import RecordEditContextInspector from './RecordEditContextInspector.svelte'
import { hasuraMutationFromEvents } from '@cozemble/data-hasura-mutations'

export let editContexts: RecordEditContext[]
$: firstContext = editContexts[0]
</script>

<div class="inspector-container">
  <div class="events-container">
    {#each editContexts as editContext, index}
      <RecordEditContextInspector {editContext} {index} />
    {/each}
  </div>
  <div class="gql-container">
    {#if firstContext}
      <h4>GraphQL</h4>
      <pre>{hasuraMutationFromEvents(
          firstContext.models,
          firstContext.eventSourcedRecord.record,
          firstContext.eventSourcedRecord.events,
        ).mutation}</pre>
    {/if}
  </div>
</div>

<style>
.inspector-container {
  display: flex;
}

.gql-container {
  margin-left: 1rem;
}
</style>
