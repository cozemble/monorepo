<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordPathFns} from "@cozemble/model-api";
    import {afterUpdate} from "svelte";

    export let recordPath: DataRecordPath
    export let record: DataRecord

    $: value = dataRecordPathFns.getValue(recordPath, record)

    afterUpdate(() => console.log({recordPath, record, value}))
</script>

{#if value}
    {value}
{:else}
    &nbsp;
{/if}
