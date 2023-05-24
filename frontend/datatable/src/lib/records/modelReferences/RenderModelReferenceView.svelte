<script lang="ts">
    import type {DataRecordId, ModelHtmlTemplate, ModelId} from "@cozemble/model-core";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {getReferencedRecord} from "$lib/records/modelReferences/dereference";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {renderReferencedRecord} from "$lib/records/modelReferences/renderReference";
    import {allModels} from "$lib/stores/allModels";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced/dist/esm";
    import type {Model} from "@cozemble/model-core/dist/esm";

    export let selectedRecordId: DataRecordId
    export let referencedModelId: ModelId
    export let summaryView: ModelHtmlTemplate

    const dataRecordViewerClient = dataRecordViewer.getClient()
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()

    let htmlRender:string|null = null

    async function computeHtml(models:Model[], graph:EventSourcedRecordGraph, referencedModelId:ModelId, selectedRecordId:DataRecordId) {
        const referencedRecord = await getReferencedRecord(dataRecordViewerClient, graph,  referencedModelId, selectedRecordId)
        htmlRender =  renderReferencedRecord(models, referencedRecord, summaryView)
    }

    $: computeHtml($allModels,$recordGraph,  referencedModelId, selectedRecordId)


</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}