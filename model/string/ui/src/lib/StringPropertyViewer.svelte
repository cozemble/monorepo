<script lang="ts">
import type { DataRecord, DataRecordPath } from '@cozemble/model-core'
import { dataRecordPathFns } from '@cozemble/model-api'

export let recordPath: DataRecordPath
export let record: DataRecord

$: value = dataRecordPathFns.getValue(recordPath, record)
</script>

{#if value}
  {value}
{:else}
  &nbsp;
{/if}
