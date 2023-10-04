<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import {flattenTables} from "./TableAI";
    import TableAnalysis from "./TableAnalysis.svelte";
    import {TableTypeGuess} from "../genai/tables/guessTableType/guessTableType";

    export let awsOcrResponse: AwsOcrResponse
    export let upload: StashPdfResponse
    const tables = flattenTables(awsOcrResponse.json.pages)

    function onTableAnalysis(event:CustomEvent<TableTypeGuess[]>) {
        console.log(event)
    }

</script>

{#if tables.length > 0}
    <TableAnalysis {tables} on:completion={onTableAnalysis}/>
{:else}
    No tables
{/if}

