<script lang="ts">
    import type {Page, Table} from "@cozemble/backend-aws-ocr-types";
    import type {TableTypeGuess} from "../genai/tables/guessTableType/guessTableType";
    import {calculateDuplicationCandidates, calculateMergeCandidates} from "./tableCalcs";
    import {createEventDispatcher} from "svelte";
    import {writable} from "svelte/store";
    import ProposeDeduplication from "./ProposeDeduplication.svelte";
    import ProposeMerge from "./ProposeMerge.svelte";

    export let pages:Page[]
    export let tables: Table[]
    export let tableAnalysis: TableTypeGuess[]
    const mergeCandidates = calculateMergeCandidates(tableAnalysis)
    const dispatch = createEventDispatcher()
    if(mergeCandidates.length === 0) {
        dispatch('complete', [])
    }
    const currentCandidateIndex = writable(0)

    function onMerge() {
        mergeCandidates[$currentCandidateIndex].shouldMerge = true
        currentCandidateIndex.update(i => i + 1)
        if($currentCandidateIndex >= mergeCandidates.length) {
            dispatch('complete', mergeCandidates)
        }
    }

    function ignoreMerge() {
        currentCandidateIndex.update(i => i + 1)
        if($currentCandidateIndex >= mergeCandidates.length) {
            dispatch('complete', mergeCandidates)
        }
    }
</script>

<!-- 
    @component
    Find out if there is multiple instances of a table and suggest the user to merge them  
    - `on:complete`: dispatches the merge candidates with `shouldMerge` property set for each
-->

{#if mergeCandidates.length > 0}
    <ProposeMerge {tables} candidate={mergeCandidates[$currentCandidateIndex]} on:merge={onMerge} on:ignore={ignoreMerge}/>
{/if}