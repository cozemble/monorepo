<script lang="ts">
    import type {RecordsContext} from "../records/RecordsContext";
    import {makeDataRecordEditorClient} from "./makeDataRecordEditorClient";
    import {getContext, setContext} from "svelte";
    import type {DataRecord} from "@cozemble/model-core";

    export let context: RecordsContext
    export let record: DataRecord

    const maybeExisting = getContext('com.cozemble.data.record.editor.client.context')
    if (!maybeExisting) {
        const dataRecordEditorClient = makeDataRecordEditorClient(context, record.id)
        setContext('com.cozemble.data.record.editor.client.context', dataRecordEditorClient)
    }
</script>
<slot></slot>