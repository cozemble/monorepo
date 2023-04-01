<script lang="ts">
    import type {DataRecord, DataRecordValuePath} from '@cozemble/model-core'
    import type {EditorParams} from "./editorHelper";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import type {DataRecordViewerClient} from "@cozemble/data-editor-sdk";
    import {dereference} from "./dereference";
    import {renderReference} from "./renderReference";
    import type {ReferencedRecords} from "@cozemble/model-reference-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let dataRecordViewerClient: DataRecordViewerClient

    let referencedRecord: DataRecord | null = null

    $: value = dataRecordValuePathFns.getValue(recordPath, record) as ReferencedRecords ?? null
    $: dereference(dataRecordViewerClient, editorParams.referencedModelId, value, (record) => referencedRecord = record)
    $: htmlRender = renderReference(referencedRecord, editorParams)


</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}