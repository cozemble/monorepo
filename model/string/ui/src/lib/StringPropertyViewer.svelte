<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {StringProperty} from "@cozemble/model-string-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    const property = recordPath.lastElement as StringProperty

    $: value = (dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? "") as string
</script>

{#if value}
    {#if property.multiline}
        {@html value.replace(/\n/g, '<br>') }
    {:else}
        {value}
    {/if}
{:else}
    &nbsp;
{/if}
