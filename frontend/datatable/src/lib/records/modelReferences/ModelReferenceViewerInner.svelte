<script lang="ts">
    import type {EditorParams} from "./editorHelper";
    import type {DataRecord, DataRecordValuePath, ModelReference, SystemConfiguration} from "@cozemble/model-core";
    import {eventSourcedRecordGraphFns} from "@cozemble/model-event-sourced";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import RenderModelReferenceView from "$lib/records/modelReferences/RenderModelReferenceView.svelte";
    import {afterUpdate} from "svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()
    const modelReference = recordPath.lastElement as ModelReference

    $: selectedRecordIds = eventSourcedRecordGraphFns.referencedRecordIds($recordGraph, record.id, modelReference)
    afterUpdate(() => console.log({selectedRecordIds, recordGraph: $recordGraph, record, modelReference}))

</script>

{#each selectedRecordIds as selectedRecordId}
    <div>
        <RenderModelReferenceView referencedRecordId={selectedRecordId}
                                  referencedModelId={editorParams.referencedModelId}
                                  recordId={record.id} summaryView={editorParams.summaryView}/>
    </div>
{/each}
