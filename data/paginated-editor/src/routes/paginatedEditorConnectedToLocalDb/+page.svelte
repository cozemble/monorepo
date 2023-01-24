<script lang="ts">
import type { DataRecord, Model } from '@cozemble/model-core'
import PaginatedEditor from '$lib/PaginatedEditor.svelte'
import { onMount } from 'svelte'
import {
  registerAllProperties,
  registerAllPropertyEditors,
  registerAllPropertyViewers,
} from '@cozemble/model-assembled'
import type {
  PaginatedEditorHost,
  RecordDeleteOutcome,
} from '$lib/PaginatedEditorHost'
import type { RecordSaveOutcome } from '$lib/RecordEditContext'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'

let models: Model[] = []
let model: Model | null = null

async function loadModels() {
  const response = await fetch('http://localhost:3000/api/v1/model/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    models = await response.json()
    console.log({ models })
  } else {
    console.error('Error loading models', response)
  }
}

onMount(() => {
  registerAllProperties()
  registerAllPropertyViewers()
  registerAllPropertyEditors()
  loadModels()
})

function useModel(m: Model) {
  model = m
}

const paginatedEditorHost: PaginatedEditorHost = {
  async recordEdited(
    _editedRecord: EventSourcedDataRecord,
  ): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },

  async saveNewRecord(
    _newRecord: EventSourcedDataRecord,
  ): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },

  async deleteRecord(_record: DataRecord): Promise<RecordDeleteOutcome> {
    throw new Error('Not implemented')
  },
}
</script>

{#each models as model}
  <a href="#!" on:click={() => useModel(model)}>{model.name.value}</a><br />
{/each}
{#if model}
  {#key model.id}
    <PaginatedEditor {models} {model} records={[]} {paginatedEditorHost} />
  {/key}
{/if}
