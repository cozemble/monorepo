<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import SubRecordPreview from "./SubRecordPreview.svelte";
    import SubTablePreview from "./SubTablePreview.svelte";

    const dispatch = createEventDispatcher()

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
            <label class="label">Sub-section type:</label>
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
