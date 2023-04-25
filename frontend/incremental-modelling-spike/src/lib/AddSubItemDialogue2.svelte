<script lang="ts">
    import type {Model} from "./types";
    import {createEventDispatcher} from "svelte";
    import SubTablePreview from "./SubTablePreview.svelte";
    import SubRecordPreview from "./SubRecordPreview.svelte";

    const dispatch = createEventDispatcher()

    export let model: Model
    let addType: "sub-record" | "sub-table" = "sub-record"
</script>

<!--<div>-->
<!--    <div class="alert alert-info flex flex-col ">-->
<!--        <div>This is a preview of how your sub-item will look like.</div>-->
<!--        <div>Click <button class="btn btn-secondary btn-sm">Apply sub-item</button> below when you're happy with it, or <button class="btn btn-sm">Cancel</button>  to exit</div>-->
<!--    </div>-->
<!--</div>-->
<div class="flex">
    <div>
        <div class="flex items-center">
            <input type="radio" name="radio-2" class="radio radio-primary" checked={addType === "sub-record"}
                   on:click={() => addType = "sub-record"}/> <label class="label">Sub-record</label>
            <input type="radio" name="radio-2" class="radio radio-primary ml-3" checked={addType === "sub-table"}
                   on:click={() => addType = "sub-table"}/> <label class="label">Sub-table</label>
        </div>

        {#if addType === "sub-table"}
<!--            <p class="text-sm">A sub-table is a table with possible many rows e.g. an "Invoice" would have many "Line Items"</p>-->
<!--            <p class="text-sm"></p>-->
            <SubTablePreview/>
        {:else}
<!--            <p class="text-sm">A sub-record is a table with always exactly one row.  Use it when your table should have one single sub-record.</p>-->
<!--            <p class="text-sm">e.g. a "Customer" would have one "Home Address"</p>-->
            <SubRecordPreview/>
        {/if}
    </div>
</div>
