<script lang="ts">
    import type {MergeCandidate} from "./tableCalcs";
    import type {Table} from "@cozemble/backend-aws-ocr-types";
    import {tableToHtml} from "../fromDocument/jsonToHtml";
    import {createEventDispatcher} from "svelte";

    export let tables: Table[]
    export let candidate: MergeCandidate
    const dispatch = createEventDispatcher()

    const mentionedTables = candidate.tableIndices.map(i => tables[i - 1])

    function applyMerge() {
        dispatch("merge")
    }

    function ignoreMerge() {
        dispatch("ignore")
    }
</script>
<div class="flex flex-col">
    <h3 class="mx-auto">These tables look like they could be merged into one "{candidate.tableLabel}" table</h3>
    <h4 class="mx-auto">Should I perform the merge?</h4>
</div>
<div class="mt-4 flex justify-center ">
    <button class="btn btn-secondary btn-sm" on:click={applyMerge}>Yes, merge them</button>
    <button class="btn btn-secondary btn-sm ml-4" on:click={ignoreMerge}>No, ignore these tables</button>
</div>
<div class="flex mt-4">
    {#each mentionedTables as table}
        {@const html = tableToHtml(table)}
        <div class="border rounded p-4 mx-2">
            {@html html}
        </div>
    {/each}
</div>
