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

    const stepOrder = [
        'tableAnalysis',
        'sectionAnalysis',
        'tableAmendments'
    ]
    let currentStep = 'sectionAnalysis'

    function onTableAnalysis(event: CustomEvent) {
        console.log({onTableAnalysisEvent:event})
        try {
            tableAnalysis = JSON.parse(event.detail)
            currentStep = stepOrder[stepOrder.indexOf(currentStep) + 1]
        } catch (e) {
            console.error(`Failed to parse table analysis event: ${e}`)
        }
    }

    function onSectionAnalysis(event: CustomEvent) {
        sectionAnalysis = JSON.parse(event.detail)
        currentStep = stepOrder[stepOrder.indexOf(currentStep) + 1]
        console.log({sectionAnalysis})
    }

    function onTableAmendmentsComplete(event:CustomEvent) {
        currentStep = stepOrder[stepOrder.indexOf(currentStep) + 1]
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
    {#if currentStep === 'tableAnalysis'}
        <TableAnalysis {tables} on:completion={onTableAnalysis}/>
    {:else if currentStep === 'sectionAnalysis'}
        <SectionAnalysis pages={awsOcrResponse.json.pages} on:completion={onSectionAnalysis}/>
    {:else if currentStep === 'tableAmendments'}
        <TableAmendments pages={awsOcrResponse.json.pages} {tables} {tableAnalysis} on:completion={onTableAmendmentsComplete}/>
    {:else}
        <p>table analysis = {JSON.stringify(tableAnalysis, null,2)}</p>
        <p>section analysis = {JSON.stringify(sectionAnalysis, null,2)}</p>
    {/if}
</div>

