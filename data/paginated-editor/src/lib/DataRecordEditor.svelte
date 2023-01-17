<script lang="ts">
    import DataRecordEditorInner from "$lib/DataRecordEditorInner.svelte";
    import type {RecordEditContext} from "$lib/RecordEditContext";

    export let recordEditContext: RecordEditContext
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void

    const record = recordEditContext.record
    const errors = recordEditContext.errors
    const focus = recordEditContext.focus
    const showErrors = recordEditContext.showErrors
</script>

<h2>{recordEditContext.title}</h2>

<DataRecordEditorInner models={recordEditContext.models} model={recordEditContext.model}
                       record={$record} parentPath={[]} errors={$errors} showErrors={$showErrors}
                       {focus} {pushContext} {popContext}/>
