<script lang="ts">
import { createEventDispatcher, onMount } from 'svelte'
import { writable } from 'svelte/store'

import type { JustErrorMessage } from '@cozemble/lang-util'
import { modelIdFns } from '@cozemble/model-api'

import { positionModal } from '../../../modelUi'
import { editableTableName } from '../../../models/editableTableName'
import { allEventSourcedModels } from '../../../stores/allModels'
import EditableStringInput from '../../../editors/EditableStringInput.svelte'
import {modelFns, modelOptions} from "@cozemble/model-api";
import {eventSourcedModelListEvents, eventSourcedModelListFns} from "@cozemble/model-event-sourced";

export let anchorElement: HTMLElement

const tableName = editableTableName(`Table ${$allEventSourcedModels.models.length + 1}`, $allEventSourcedModels.models)
const newTableNameErrors = tableName.errors
const newTableName = tableName.value

const showErrors = writable(false)
const dispatch = createEventDispatcher()
let saveError: JustErrorMessage | null = null
let addTableModal: HTMLDivElement

//

function cancelNewTable() {
  dispatch('cancel')
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cancelNewTable()
  }
  if (event.key === 'Enter') {
    saveNewTable()
  }
}

async function saveNewTable() {
  saveError = null

  if ($newTableNameErrors.length > 0) {
    showErrors.set(true)
  } else {
    if ($newTableName === null) {
      throw new Error('newTableName is null')
    }

    const newModelId = modelIdFns.newInstance()
    const newModel = modelFns.newInstance($newTableName, modelOptions.withId(newModelId), modelOptions.withProperty(`Field 1`))
    allEventSourcedModels.update(list => eventSourcedModelListFns.addEvent(list, eventSourcedModelListEvents.addModel(newModel)))

    const saveOutcome = await allEventSourcedModels.save()

    if (saveOutcome === null) {
      dispatch('added', { modelId: newModelId })
    } else {
      saveError = saveOutcome
    }
  }
}

onMount(() => positionModal(addTableModal, anchorElement))
</script>

<svelte:window on:keyup={onKeyUp} />

<div bind:this={addTableModal} class="coz-modal">
  <div class="modal-box mx-8">
    <h3 class="font-bold text-lg">Add new table</h3>

    <div class="mt-2">
      <label class="label">Table name</label>

      <EditableStringInput
        value={tableName}
        {showErrors}
        extraClasses="first table-name"
      />
    </div>

    <div class="modal-action justify-center">
      <button class="btn btn-primary" on:click={saveNewTable}>Add table</button>
      <button class="btn btn-secondary" on:click={cancelNewTable}>Cancel</button
      >
    </div>
  </div>
</div>
