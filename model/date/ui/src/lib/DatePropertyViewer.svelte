<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {DateProperty} from "@cozemble/model-date-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    const property = recordPath.lastElement as DateProperty

    $: value = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
