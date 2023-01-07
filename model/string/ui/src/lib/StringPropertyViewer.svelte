<script lang="ts">
import type { DataRecord, DataRecordPath } from '@cozemble/model-core'

export let recordPath: DataRecordPath
export let record: DataRecord

$: value = recordPath.getValue(record)
</script>

{#if value}
  {value}
{/if}
