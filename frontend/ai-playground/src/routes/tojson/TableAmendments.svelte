<script lang="ts">
    import type {TableTypeGuess} from "../genai/tables/guessTableType/guessTableType";
    import type {Page, Table} from "@cozemble/backend-aws-ocr-types";
    import TableDeduplication from "./TableDeduplication.svelte";
    import type {DuplicationCandidate, MergeCandidate} from "./tableCalcs";
    import TableMerging from "./TableMerging.svelte";
    import {createEventDispatcher} from "svelte";

    export let pages: Page[]
    export let tables: Table[]
    export let tableAnalysis: TableTypeGuess[]
    const dispatch = createEventDispatcher()
    let deduplicationComplete = false
    let mergesComplete = false
    let deDuplicationDecision: DuplicationCandidate[] = []
    let mergedTables: MergeCandidate[] = []

    function onDeduplicationComplete(event: CustomEvent) {
        deDuplicationDecision = event.detail
        deduplicationComplete = true
    }

    function onMergeComplete(event: CustomEvent) {
        mergedTables = event.detail
        mergesComplete = true
        dispatch('completion', {deDuplicationDecision, mergedTables})
    }
</script>

<!--
    @component

-->

{#if !deduplicationComplete}
    <!-- Find duplications first -->
    <TableDeduplication {pages} {tables} {tableAnalysis} on:complete={onDeduplicationComplete}/>
{:else if !mergesComplete}
    <!-- Then find merges -->
    <TableMerging {pages} {tables} {tableAnalysis} on:complete={onMergeComplete}/>
{:else}
    <!-- Finished -->
    <p>dedupe decision = {JSON.stringify(deDuplicationDecision, null, 2)}</p>
    <p>merge decision = {JSON.stringify(mergedTables, null, 2)}</p>
{/if}