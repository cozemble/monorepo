<script lang="ts">
    import type {RecordsContext} from "../records/RecordsContext";
    import {makeDataRecordEditorClient} from "./makeDataRecordEditorClient";
    import {setContext} from "svelte";

    export let context: RecordsContext

    const dataRecordEditorClient = makeDataRecordEditorClient(context)
    setContext('com.cozemble.data.record.editor.client.context', dataRecordEditorClient)
</script>
<slot></slot>