<script lang="ts">
import type { DataRecordEditEvent } from '@cozemble/data-editor-sdk'

export let editEvent: DataRecordEditEvent
</script>

<pre>{JSON.stringify(editEvent, null, 2)}</pre>
