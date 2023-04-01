<script lang="ts">
    import type {DataRecord, DataRecordValuePath} from '@cozemble/model-core'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let recordPath: DataRecordValuePath
    export let record: DataRecord

    $: value = dataRecordValuePathFns.getValue(recordPath, record)
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
