<script lang="ts">
    import type {Action, MergeTables} from "../ocr-as-html/ocrCorrectiveActions";
    import {mergeTables} from "../ocr-as-html/ocrCorrectiveActions";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import {zodErrors} from "../ocr-as-html/zodErrors";
    import {derivedLabelledTables} from "./helpers";

    export let correctiveActions: Writable<Action[]>
    const action = writable({} as any as MergeTables)
    const errors = zodErrors(mergeTables, action)
    const labeledTables = derivedLabelledTables(correctiveActions)
</script>
<div class="tabs">
    <a class="tab tab-lifted tab-active">Merge tables</a>
</div>

{#if $labeledTables.length === 0}
    <div class="flex flex-col items-center p-8 border">
        <div><h6>To merge tables, we need to first "label" the tables in the document</h6></div>
        <div class="mt-2"><p class="whitespace-nowrap">You can label a table by specifying what words you expect to see in the table header</p></div>
        <div class="mt-2"><p class="whitespace-nowrap">Two or more tables can have the same label - that is how you can merge them</p></div>
    </div>
{:else}
    <div class="flex flex-col">
        <div>
            <label class="label">Which tables?</label>
            <select class="input input-bordered">
                <option>----</option>
                {#each $labeledTables as label}
                    <option value={label}>{label}</option>
                {/each}
            </select>
        </div>
    </div>
{/if}
