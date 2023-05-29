<script lang="ts">
import type { DataRecordEditEvent } from '@cozemble/model-event-sourced'

export let editEvent: DataRecordEditEvent
</script>

<pre>{JSON.stringify(editEvent, null, 2)}</pre>
