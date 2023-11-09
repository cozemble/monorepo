<script lang="ts">
    import type {Page, Table} from "@cozemble/backend-aws-ocr-types";
    import type {TableTypeGuess} from "../genai/tables/guessTableType/guessTableType";
    import {calculateDuplicationCandidates} from "./tableCalcs";
    import {createEventDispatcher} from "svelte";
    import {writable} from "svelte/store";
    import ProposeDeduplication from "./ProposeDeduplication.svelte";

    export let pages:Page[]
    export let tables: Table[]
    export let tableAnalysis: TableTypeGuess[]
    const duplicationCandidates = calculateDuplicationCandidates(tableAnalysis)
    console.log({duplicationCandidates})
    const dispatch = createEventDispatcher()
    if(duplicationCandidates.length === 0) {
        dispatch('complete', [])
    }
    const currentCandidateIndex = writable(0)

    function onDedupe() {
        duplicationCandidates[$currentCandidateIndex].shouldDedupe = true
        currentCandidateIndex.update(i => i + 1)
        if($currentCandidateIndex >= duplicationCandidates.length) {
            dispatch('complete', duplicationCandidates)
        }
    }

    function ignoreDuplicate() {
        currentCandidateIndex.update(i => i + 1)
        if($currentCandidateIndex >= duplicationCandidates.length) {
            dispatch('complete', duplicationCandidates)
        }
    }
</script>

<!-- 
    @component
    Find out if there is duplications in the tables and suggest the user to dedupe them
    - `on:complete`: dispatches the duplication candidates with the `shouldDedupe` property set for each
-->

{#if duplicationCandidates.length > 0}
    <ProposeDeduplication {tables} candidate={duplicationCandidates[$currentCandidateIndex]} on:dedupe={onDedupe} on:ignore={ignoreDuplicate}/>
{/if}