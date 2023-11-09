<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import type {StashPdfResponse} from "@cozemble/backend-aws-ocr-types";
    import {flattenTables} from "./TableAI";
    import TableAnalysis from "./TableAnalysis.svelte";
    import type {TableTypeGuess, SectionGuess} from "../genai/tables/guessTableType/guessTableType";
    import SectionAnalysis from "./SectionAnalysis.svelte";
    import TableAmendments from "./TableAmendments.svelte";

    export let awsOcrResponse: AwsOcrResponse
    export let upload: StashPdfResponse
    const tables = flattenTables(awsOcrResponse.json.pages)
    let tableAnalysis: TableTypeGuess[] = []
    let sectionAnalysis: SectionGuess[] = []
    let sectionAnalysisComplete = true
    let tableAnalysisComplete = tables.length <= 0
    let tableAmendmentComplete = false

    function onTableAnalysis(event: CustomEvent) {
        tableAnalysis = JSON.parse(event.detail)
        tableAnalysisComplete = true
    }

    function onSectionAnalysis(event: CustomEvent) {
        sectionAnalysis = JSON.parse(event.detail)
        sectionAnalysisComplete = true
    }

    function onTableAmendmentsComplete(event:CustomEvent) {
        tableAmendmentComplete = true
        const {deDuplicationDecision, mergedTables} = event.detail
        console.log({deDuplicationDecision, mergedTables})
    }
</script>

<!-- 
    @component
    Analyze the tables and sections in the OCR response
    - Analyzes the tables in one step
    - Analyzes the sections in another step
 -->
 
<div>
    {#if !tableAnalysisComplete}
        <TableAnalysis {tables} on:completion={onTableAnalysis}/>
    {:else if !sectionAnalysisComplete}
        <SectionAnalysis pages={awsOcrResponse.json.pages} on:completion={onSectionAnalysis}/>
    {:else if !tableAmendmentComplete}
        <TableAmendments pages={awsOcrResponse.json.pages} {tables} {tableAnalysis} on:completion={onTableAmendmentsComplete}/>
    {:else}
        <p>table analysis = {JSON.stringify(tableAnalysis, null,2)}</p>
        <p>section analysis = {JSON.stringify(sectionAnalysis, null,2)}</p>
    {/if}
</div>

