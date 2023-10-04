<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import {flattenTables} from "./TableAI";
    import TableAnalysis from "./TableAnalysis.svelte";
    import type {TableTypeGuess} from "../genai/tables/guessTableType/guessTableType";
    import SectionAnalysis from "./SectionAnalysis.svelte";

    export let awsOcrResponse: AwsOcrResponse
    export let upload: StashPdfResponse
    const tables = flattenTables(awsOcrResponse.json.pages)
    let tableAnalysis: TableTypeGuess[] = []

    function onTableAnalysis(event: CustomEvent) {
        tableAnalysis = JSON.parse(event.detail)
        console.log({tableAnalysis})
    }

    function onSectionAnalysis(event: CustomEvent) {
        console.log({event})
    }

</script>

{#if tables.length > 0 && tableAnalysis.length <= 0}
    <TableAnalysis {tables} on:completion={onTableAnalysis}/>
{:else}
    <SectionAnalysis pages={awsOcrResponse.json.pages} on:completion={onSectionAnalysis}/>
{/if}

