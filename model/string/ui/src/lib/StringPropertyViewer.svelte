<script lang="ts">
    import type {DataRecord, DataRecordPropertyPath} from '@cozemble/model-core'
    import {dataRecordPathFns} from '@cozemble/model-api'

    export let recordPath: DataRecordPropertyPath
    export let record: DataRecord

    $: value = dataRecordPathFns.getValue(recordPath, record)
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
