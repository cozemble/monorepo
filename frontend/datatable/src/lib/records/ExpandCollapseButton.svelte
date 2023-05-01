<script lang="ts">
    import type {DataRecordId, DataRecord,Model} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";

    export let model: Model
    export let record: DataRecord
    export let expandedRecordIds:Writable<DataRecordId[]>

    function toggleRecordExpand(record: DataRecord) {
        if ($expandedRecordIds.find(r => r.value === record.id.value)) {
            expandedRecordIds.update(r => r.filter(r => r.value !== record.id.value))
        } else {
            expandedRecordIds.update(r => [...r, record.id])
        }
    }
</script>

{#if model.nestedModels.length > 0}
    <button class="btn btn-ghost btn-active btn-sm mr-2"
            on:click={() => toggleRecordExpand(record)}>
        {#if $expandedRecordIds.some(id => id.value  === record.id.value)}
            Collapse
        {:else}
            Expand
        {/if}
    </button>
{/if}
