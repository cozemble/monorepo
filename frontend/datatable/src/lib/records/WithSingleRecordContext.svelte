<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import {getContext, setContext} from "svelte";
    import {makeDataRecordEditorClient} from "./makeDataRecordEditorClient";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";

    export let record: DataRecord

    const maybeExisting = getContext('com.cozemble.data.record.editor.client.context')
    if (!maybeExisting) {
        const records = modelRecordsContextFns.getEventSourcedRecords()
        const dataRecordEditorClient = makeDataRecordEditorClient(records, modelRecordsContextFns.getFocusControls(),record.id)
        setContext('com.cozemble.data.record.editor.client.context', dataRecordEditorClient)
    }

</script>
<slot></slot>