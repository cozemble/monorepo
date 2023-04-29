<script lang="ts">
    import type {Model} from "./types";
    import {createEventDispatcher} from "svelte";
    import SubTablePreview from "./SubTablePreview.svelte";
    import SubRecordPreview from "./SubRecordPreview.svelte";

    const dispatch = createEventDispatcher()

    export let model: Model
    let addType: "sub-record" | "sub-table" = "sub-record"

    function onSubRecordApply(event: CustomEvent) {
        dispatch("addNestedRecord", event.detail)
    }

    function onSubTableApply(event: CustomEvent) {
        dispatch("addNestedTable", event.detail)
    }
</script>

<div class="flex">
    <div>
        <div class="flex items-center mb-2">
            <label class="label">Sub-item type:</label>
            <input type="radio" name="radio-2" class="radio radio-primary ml-3" checked={addType === "sub-record"}
                   on:click={() => addType = "sub-record"}/> <label class="label">Sub-record</label>
            <input type="radio" name="radio-2" class="radio radio-primary ml-3" checked={addType === "sub-table"}
                   on:click={() => addType = "sub-table"}/> <label class="label">Sub-table</label>
        </div>

        {#if addType === "sub-table"}
            <SubTablePreview on:close on:apply={onSubTableApply}/>
        {:else}
            <SubRecordPreview on:close on:apply={onSubRecordApply}/>
        {/if}
    </div>
</div>
