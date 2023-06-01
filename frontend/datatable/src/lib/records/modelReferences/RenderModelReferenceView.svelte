<script lang="ts">
    import type {DataRecordId, Model, ModelHtmlTemplate, ModelId} from "@cozemble/model-core";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {getReferencedRecord} from "$lib/records/modelReferences/dereference";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {renderReferencedRecord} from "$lib/records/modelReferences/renderReference";
    import {allModels} from "$lib/stores/allModels";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced";

    export let recordId: DataRecordId
    export let referencedRecordId: DataRecordId
    export let referencedModelId: ModelId
    export let summaryView: ModelHtmlTemplate

    const dataRecordViewerClient = dataRecordViewer.getClient()
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()
    const subGraphCollectorsByRecordId = modelRecordsContextFns.getSubGraphCollectorsByRecordId()

    let htmlRender: string | null = null

    async function computeHtml(models: Model[], graph: EventSourcedRecordGraph, referencedModelId: ModelId, selectedRecordId: DataRecordId) {
        const referencedRecord = await getReferencedRecord(dataRecordViewerClient, graph, recordId,subGraphCollectorsByRecordId, referencedModelId, selectedRecordId)
        console.log({referencedRecord, selectedRecordId})
        htmlRender = renderReferencedRecord(models, referencedRecord, summaryView)
    }

    $: computeHtml($allModels, $recordGraph, referencedModelId, referencedRecordId)

</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}