<script lang="ts">
import {
  registerAllProperties,
  registerAllPropertyConfigurers,
} from '@cozemble/model-assembled'
import { onMount } from 'svelte'
import PropertyEditor from '$lib/PropertyEditor.svelte'
import { modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import type { ModelEvent, ModelId } from '@cozemble/model-core'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { ModelChangeHandler } from '$lib/ModelEditorHost'

let mounted = false
onMount(() => {
  registerAllProperties()
  registerAllPropertyConfigurers()
  mounted = true
})

let eventSourced = eventSourcedModelFns.newInstance(
  modelFns.newInstance(
    'My model',
    modelOptions.withProperty(propertyFns.newInstance("Untitled Property")),
  ),
)
$: property = eventSourced.model.properties[0]

const modelChangeHandler: ModelChangeHandler = {
  modelChanged(_id: ModelId, event: ModelEvent) {
    eventSourced = eventSourcedModelFns.addEvent(eventSourced, event)
  },
}
</script>

{#if mounted}
  <PropertyEditor {property} {modelChangeHandler} model={eventSourced.model} />
{/if}
