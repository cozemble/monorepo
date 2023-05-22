<!-- TODO move to '&/lib/components/nav/AddModelButton.svelte'-->
<script lang="ts">
import { createEventDispatcher } from 'svelte'

import AddTableModal from './AddTableModal_r.svelte'
import { allEventSourcedModels } from './stores/allModels'

const dispatch = createEventDispatcher()

let rootDiv: HTMLDivElement
let addingTable = false

async function addModel() {
  console.log('adding table')
  addingTable = true
}

function cancel() {
  addingTable = false
}

function onAdded(event: CustomEvent) {
  dispatch('added', event.detail)
  cancel()
}
</script>

<div bind:this={rootDiv}>
  <button class="tab tab-lg add-table-link" on:click={addModel}>
    {#if $allEventSourcedModels.models.length === 0}
      + Add your first table
    {:else}
      + Add table
    {/if}
  </button>
</div>

{#if addingTable}
  <AddTableModal
    anchorElement={rootDiv}
    on:cancel={cancel}
    on:added={onAdded}
  />
{/if}
