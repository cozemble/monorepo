<script lang="ts">
// types
import type { Writable } from 'svelte/store'
import type { ModelId } from '@cozemble/model-core'

import { writable } from 'svelte/store'

// stores
import { modelUi } from '$lib/modelUi'
import { contextHelper } from '$lib/stores/contextHelper'
import {
  allEventSourcedModels,
  allTopLevelEventSourcedModels,
} from '$lib/stores/allModels'
// components
import NavItem from '$lib/components/editor/nav/NavItem.svelte'
import AddModelButton from '$lib/components/editor/nav/AddModelButton.svelte'

export let navbarState: Writable<string | null> = writable(null)

const isModellingPermitted = contextHelper.getPermitModelling()

function onShowModel(modelId: ModelId) {
  navbarState.set(modelId.value)
}

function onEditModel(clicked: Event, modelIndex: number) {
  clicked.stopPropagation()

  const model = $allTopLevelEventSourcedModels[modelIndex]
  const anchor = (clicked.target as HTMLElement).closest(
    `.model-${modelIndex + 1}`,
  ) as HTMLElement

  if (model && anchor) {
    modelUi.edit($allEventSourcedModels, model, anchor)
  }
}

function onAddModel(event: CustomEvent) {
  event.detail.modelId && onShowModel(event.detail.modelId)
}
</script>

<div class="tabs bg-base-200 rounded pb-1 pl-2">
  {#each $allTopLevelEventSourcedModels as esModel, index}
    <NavItem {esModel} {index} {navbarState} {onEditModel} />
  {/each}

  {#if $isModellingPermitted}
    <AddModelButton on:added={onAddModel} />
  {/if}
</div>
