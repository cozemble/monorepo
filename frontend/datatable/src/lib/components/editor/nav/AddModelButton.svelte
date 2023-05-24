<script lang="ts">
import { createEventDispatcher } from 'svelte'

import AddModelModal from './AddModelModal.svelte'
import { allEventSourcedModels } from '../../../stores/allModels'

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
    {#if $allEventSourcedModels.length === 0}
      + Add your first table
    {:else}
      + Add table
    {/if}
  </button>
</div>

{#if addingTable}
  <AddModelModal
    anchorElement={rootDiv}
    on:cancel={cancel}
    on:added={onAdded}
  />
{/if}
