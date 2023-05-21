<!-- TODO (refactor): move into '$lib/components/Editor.svelte' -->
<script lang="ts">
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

// Cozemble
import type { ModelId } from '@cozemble/model-core'

import AddTableNavButton from './AddTableNavButton_r.svelte'
import Modals from './Modals.svelte'
import { modelUi } from './modelUi'
import {
  allEventSourcedModels,
  allTopLevelEventSourcedModels,
} from './stores/allModels'
import ModelPane from './models/ModelPane.svelte'
import ModelTab from './ModelTab_r.svelte'
import { contextHelper } from './stores/contextHelper'
import RecordCreatorContext from './records/creator/RecordCreatorContext.svelte'

export let navbarState: Writable<string | null> = writable(null)

const isModellingPermitted = contextHelper.getPermitModelling()

//

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
//
</script>

<div class="tabs bg-base-200 rounded pb-1 pl-2">
  {#each $allTopLevelEventSourcedModels as esModel, index}
    <ModelTab {esModel} {index} {navbarState} {onEditModel} />
  {/each}

  {#if $isModellingPermitted}
    <AddTableNavButton on:added={onAddModel} />
  {/if}
</div>

{#if $navbarState}
  {#key $navbarState}
    <RecordCreatorContext>
      <ModelPane modelId={$navbarState} />
    </RecordCreatorContext>
  {/key}
{/if}

<Modals />
