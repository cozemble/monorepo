<script lang="ts">
    import type {DuplicationCandidate} from "./tableCalcs";
    import type {Table} from "@cozemble/backend-aws-ocr-types";
    import {tableToHtml} from "../fromDocument/jsonToHtml";
    import {createEventDispatcher} from "svelte";

    export let tables: Table[]
    export let candidate: DuplicationCandidate
    const dispatch = createEventDispatcher()

    const mentionedTables = candidate.tableIndices.map(i => tables[i - 1])

    function removeDuplicate() {
        dispatch("dedupe")
    }

    function ignoreDuplicate() {
        dispatch("ignore")
    }
</script>

<!-- 
    @component
    Show the user a table that looks like a duplicate and ask them if they want to remove it
    - `on:dedupe`: dispatched when the user wants to remove the duplicate
    - `on:ignore`: dispatched when the user wants to ignore the duplicate
-->

<div class="flex flex-col">
    <h3 class="mx-auto">These tables look like repeated "{candidate.tableLabel}" tables</h3>
    <h4 class="mx-auto">Should I remove the duplicates?</h4>
</div>

<div class="mt-4 flex justify-center ">
    <button class="btn btn-secondary btn-sm" on:click={removeDuplicate}>Yes, remove the duplicates</button>
    <button class="btn btn-secondary btn-sm ml-4" on:click={ignoreDuplicate}>No, ignore these tables</button>
</div>

<div class="flex mt-4">
    {#each mentionedTables as table}
        {@const html = tableToHtml(table)}
        <div class="border rounded p-4 mx-2">
            {@html html}
        </div>
    {/each}
</div>
