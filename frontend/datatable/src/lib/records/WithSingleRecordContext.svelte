<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import {getContext, setContext} from "svelte";
    import {makeDataRecordEditorClient} from "./makeDataRecordEditorClient";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";

    export let record: DataRecord
    export let rowIndex: number

    const maybeExisting = getContext('com.cozemble.data.record.editor.client.context')
    if (!maybeExisting) {
        const records = modelRecordsContextFns.getEventSourcedRecords()
        const dataRecordEditorClient = makeDataRecordEditorClient(records, modelRecordsContextFns.getFocusControls(),record.id)
        setContext('com.cozemble.data.record.editor.client.context', dataRecordEditorClient)
    }

    let rootRecordIndex = getContext('single.record.context.root.record.index') as number
    if(rootRecordIndex === undefined) {
        rootRecordIndex = rowIndex
        setContext('single.record.context.root.record.index', rootRecordIndex)

    }

</script>
<slot {rootRecordIndex}></slot>