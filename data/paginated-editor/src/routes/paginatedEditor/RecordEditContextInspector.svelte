<script lang="ts">
import type { RecordEditContext } from '../../lib/RecordEditContext'
import DataRecordEditEventInspector from './DataRecordEditEventInspector.svelte'
import { dataRecordEditEventSummariser } from './dataRecordEditEventSummariser'
import type {DataRecordEditEvent} from "@cozemble/model-event-sourced";

export let editContext: RecordEditContext
export let index: number

let showEventIndex = -1

function showEvent(index: number) {
  if (showEventIndex === index) {
    showEventIndex = -1
  } else {
    showEventIndex = index
  }
}

$: indent = index * 40

function eventSummary(editEvent: DataRecordEditEvent) {
  const maybeSummary = dataRecordEditEventSummariser(editEvent)
  if (maybeSummary) {
    return ` (${maybeSummary})`
  } else {
    return ''
  }
}
</script>

<div style="margin-left: {indent}px;">
  {#each editContext.eventSourcedRecord.events as editEvent, index}
    <div>
      <a href="#!" on:click={() => showEvent(index)}
        >{index}. {editEvent._type}</a
      >
      {eventSummary(editEvent)}
    </div>
  {/each}

  {#if showEventIndex >= 0}
    <div>
      <DataRecordEditEventInspector
        editEvent={editContext.eventSourcedRecord.events[showEventIndex]}
      />
      <button on:click={() => (showEventIndex = -1)}>Clear</button>
    </div>
  {/if}
</div>
