<script lang="ts">
    import DataRecordEditorInner from './DataRecordEditorInner.svelte'
    import type {RecordEditContext} from "./RecordEditContext";

    export let recordEditContext: RecordEditContext
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void

</script>

<h2 class="font-bold text-xl whitespace-nowrap">{recordEditContext.title}</h2>

<DataRecordEditorInner
        {recordEditContext}
        parentPath={[]}
        {pushContext}
        {popContext}/>

<style>
    h2 {
        white-space: nowrap;
    }
</style>