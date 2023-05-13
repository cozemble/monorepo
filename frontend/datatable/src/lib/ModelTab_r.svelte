<script lang="ts">
import type { Writable } from 'svelte/store'

import type { ModelId } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'

import DownCaret from './icons/DownCaret.svelte'
import { contextHelper } from './stores/contextHelper'

export let esModel: EventSourcedModel
export let index: number
export let navbarState: Writable<string | null>
export let onEditModel: (clicked: Event, modelIndex: number) => void

const isModellingPermitted = contextHelper.getPermitModelling()

const onShow = (modelId: ModelId) => navbarState.set(modelId.value)

const onEdit = (clicked: Event) => onEditModel(clicked, index)
</script>

<div class="flex items-center">
  <button
    class="tab tab-lg model-{index + 1}"
    class:tab-active={$navbarState === esModel.model.id.value}
    on:click={() => onShow(esModel.model.id)}
  >
    {esModel.model.pluralName.value}

    {#if $isModellingPermitted}
      <span on:click={onEdit} on:keydown={onEdit} class="ml-2 mt-1">
        <DownCaret /></span
      >
    {/if}
  </button>
</div>
