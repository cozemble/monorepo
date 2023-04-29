<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {DecimalProperty} from "@cozemble/model-decimal-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    const property = recordPath.lastElement as DecimalProperty

    $: value = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
