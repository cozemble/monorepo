<script lang="ts">
    import type {EditorParams} from "./editorHelper";
    import type {DataRecord, DataRecordValuePath, ModelReference, SystemConfiguration} from "@cozemble/model-core";
    import type {RecordAndEdges} from "@cozemble/model-core";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {eventSourcedRecordGraphFns} from "@cozemble/model-event-sourced";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {dereference} from "$lib/records/modelReferences/dereference";
    import {renderReference} from "$lib/records/modelReferences/renderReference";
    import {afterUpdate} from "svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()
    const modelReference = recordPath.lastElement as ModelReference

    const dataRecordViewerClient = dataRecordViewer.getClient()

    $: selectedRecordIds = eventSourcedRecordGraphFns.referencedRecordIds($recordGraph, record.id, modelReference)

    let referencedRecord: RecordAndEdges | null = null
    let htmlRender: string | null = null

    $: dereference(dataRecordViewerClient, $recordGraph, editorParams.referencedModelId, selectedRecordIds, (record) => referencedRecord = record)
    $: htmlRender = renderReference(referencedRecord, editorParams)

    afterUpdate(() => console.log({selectedRecordIds, graph: $recordGraph}))
</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}