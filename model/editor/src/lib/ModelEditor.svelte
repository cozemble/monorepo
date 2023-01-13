<script lang="ts">
import { EditableName } from '@cozemble/ui-atoms'
import type { ModelEditorHost } from '$lib/ModelEditorHost'
import ModelStructureEditor from '$lib/ModelStructureEditor.svelte'
import type { ModelId } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { coreModelEvents } from '@cozemble/model-event-sourced'
import type { Writable } from 'svelte/store'
import { modelNameFns } from '@cozemble/model-core'

export let modelId: ModelId
export let host: ModelEditorHost
export let allModels: Writable<EventSourcedModel[]>

$: eventSourced = host.modelWithId($allModels, modelId)

function onNameChange(name: string) {
  host.modelChanged(
    modelId,
    coreModelEvents.modelRenamed(
      eventSourced.model.id,
      modelNameFns.newInstance(name),
    ),
  )
}
</script>

{#if eventSourced}
  <EditableName
    nameable={{ name: eventSourced.model.name.value }}
    {onNameChange}
    extraClass="model-name"
  />

  <ModelStructureEditor {eventSourced} {host} allModels={$allModels} />
{/if}
