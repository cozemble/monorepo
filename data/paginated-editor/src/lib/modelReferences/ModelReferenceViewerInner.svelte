<script lang="ts">
    import type {EditorParams} from "./editorHelper";
    import type {DataRecord, DataRecordValuePath, ReferencedRecords} from "@cozemble/model-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {dereference} from "./dereference";
    import {renderReference} from "./renderReference";
    import type {SystemConfiguration} from "@cozemble/model-core";
    import type {RecordAndEdges} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration

    const dataRecordViewerClient = dataRecordViewer.getClient()

    let referencedRecord: RecordAndEdges | null = null

    $: referencedRecords = dataRecordValuePathFns.getValue(systemConfiguration,recordPath, record) as ReferencedRecords ?? null
    $: dereference(dataRecordViewerClient, editorParams.referencedModelId, referencedRecords, (record) => referencedRecord = record)
    $: htmlRender = renderReference(referencedRecord, editorParams)

</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}