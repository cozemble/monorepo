<script lang="ts">
    import type {EditorParams} from "./editorHelper";
    import type {DataRecord, DataRecordId, DataRecordValuePath} from "@cozemble/model-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {dereference} from "./dereference";
    import {renderReference} from "./renderReference";
    import type {ReferencedRecords} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    const dataRecordViewerClient = dataRecordViewer.getClient()

    let referencedRecord: DataRecord | null = null

    console.log({record})
    $: referencedRecords = dataRecordValuePathFns.getValue(recordPath, record) as ReferencedRecords ?? null
    $: dereference(dataRecordViewerClient, editorParams.referencedModelId, referencedRecords, (record) => referencedRecord = record)
    $: htmlRender = renderReference(referencedRecord, editorParams)


</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}