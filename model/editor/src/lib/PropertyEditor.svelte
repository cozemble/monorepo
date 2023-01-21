<script lang="ts">
import type { Model, Property, PropertyDescriptor } from '@cozemble/model-core'
import {
  propertyDescriptors,
  propertyNameFns,
  propertyTypeFns,
} from '@cozemble/model-core'
import { propertyConfigurerRegistry } from '@cozemble/model-assembled'
import { editorHost, emptyFormErrorState } from '@cozemble/model-editor-sdk'
import { writable } from 'svelte/store'
import { createEventDispatcher } from 'svelte'
import type { ModelChangeHandler } from '$lib/ModelEditorHost'
import { coreModelEvents } from '@cozemble/model-event-sourced'

export let modelChangeHandler: ModelChangeHandler
export let model: Model
export let property: Property

const formSectionErrorState = writable(emptyFormErrorState())
editorHost.setErrorState(formSectionErrorState)

let propertyDescriptor: PropertyDescriptor | null = null

function propertyTypeChanged(event: Event) {
  const target = event.target as HTMLSelectElement
  propertyDescriptor = propertyDescriptors.get(
    propertyTypeFns.newInstance(target.value),
  )
  if (propertyDescriptor) {
    modelChangeHandler.modelChanged(
      model.id,
      propertyDescriptor.newProperty(model.id, property.name, property.id),
    )
  } else {
    alert('No property descriptor found for ' + target.value)
  }
}

$: configurer = propertyConfigurerRegistry.get(property.propertyType)
$: errors = propertyDescriptor?.validateProperty(property) ?? new Map()
const dispatch = createEventDispatcher()

function saveClicked() {
  const errors = propertyDescriptor?.validateProperty(property) ?? new Map()
  $formSectionErrorState.showErrors = errors.size > 0
  if (errors.size === 0) {
    dispatch('save', { property })
  }
}

function propertyNameChanged(event: Event) {
  const target = event.target as HTMLInputElement
  modelChangeHandler.modelChanged(
    model.id,
    coreModelEvents.propertyRenamed(
      model.id,
      property.id,
      propertyNameFns.newInstance(target.value),
    ),
  )
}

function booleanChanged(event: Event, booleanName: 'required' | 'unique') {
  const target = event.target as HTMLInputElement
  modelChangeHandler.modelChanged(
    model.id,
    coreModelEvents.booleanPropertyChanged(
      model.id,
      property.id,
      booleanName,
      target.checked,
    ),
  )
}
</script>

<form>
  <label>Property Name</label><br />
  <input
    value={property.name.value}
    class="property-name"
    on:change={propertyNameChanged}
  /><br />
  <label>Property Type</label><br />
  <select on:change={propertyTypeChanged} class="property-type">
    <option value="">----</option>
    {#each propertyDescriptors.list() as propertyDescriptor}
      <option
        value={propertyDescriptor.propertyType.type}
        selected={propertyTypeFns.equals(
          property.propertyType,
          propertyDescriptor.propertyType,
        )}>{propertyDescriptor.name.name}</option
      >
    {/each}
  </select><br />

  <label class="label">
    <input
      type="checkbox"
      name="checkbox"
      value="text"
      checked={property.required}
      class="required-toggle"
      on:change={(event) => booleanChanged(event, 'required')}
    />
    Required
  </label>

  <br />

  <label class="label">
    <input
      type="checkbox"
      name="checkbox"
      value="text"
      bind:checked={property.unique}
      class="unique-toggle"
    />
    Unique
  </label>

  {#if configurer}
    <br />
    <svelte:component this={configurer} {property} />
  {/if}
</form>

<button
  type="submit"
  on:click|preventDefault={saveClicked}
  disabled={errors.size > 0}
  class="save-property"
  >Save
</button>
