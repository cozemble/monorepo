<script lang="ts">
import DataRecordEditor from '$lib/DataRecordEditor.svelte'
import type {
  DataRecordControlEvent,
  DataRecordEditEvent,
  DataRecordEditorClient,
} from '@cozemble/data-editor-sdk'
import { dataRecordEditorHost } from '@cozemble/data-editor-sdk'
import type { RecordEditContext } from '$lib/RecordEditContext'
import { getEditRecordListener } from '$lib/EditRecordListener'
import { getContext, onMount, onDestroy } from 'svelte'

export let recordEditContext: RecordEditContext
export let pushContext: (context: RecordEditContext) => void
export let popContext: () => void

const editListener = getEditRecordListener(getContext)

function handleCancel() {
  recordEditContext.cancel()
}

async function handleSave() {
  console.log('Saving record')
  await recordEditContext.attemptSave()
}

const dataRecordEditorClient: DataRecordEditorClient = {
  dispatchEditEvent(event: DataRecordEditEvent): void {
    editListener.onEvent(recordEditContext, event)
    recordEditContext.handleDataRecordEditEvent(event)
  },
  dispatchControlEvent(event: DataRecordControlEvent): void {
    console.log({ event })
  },
}
dataRecordEditorHost.setClient(dataRecordEditorClient)

onMount(() => {
  editListener.beginEdit(recordEditContext)
})
onDestroy(() => {
  editListener.popEdit()
})
</script>

<DataRecordEditor {recordEditContext} {pushContext} {popContext} />

<div class="buttons">
  <button type="button" class="save" on:click={handleSave}>Save</button>
  <button type="button" class="cancel" on:click={handleCancel}>Cancel</button>
</div>

<style>
.buttons {
  margin-top: 1rem;
}
</style>
