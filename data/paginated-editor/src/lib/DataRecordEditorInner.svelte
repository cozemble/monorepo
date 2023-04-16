<script lang="ts">
    import type {DataRecordPathParentElement,} from '@cozemble/model-core'
    import DataRecordTable from './DataRecordTable.svelte'
    import NestedRecordArrayEditor from './NestedRecordArrayEditor.svelte'
    import NestedRecordEditor from './NestedRecordEditor.svelte'
    import type {RecordEditContext} from './RecordEditContext'

    export let recordEditContext: RecordEditContext
    const record = recordEditContext.record
    const model = recordEditContext.model
    const models = recordEditContext.models
    const errors = recordEditContext.errors
    const showErrors = recordEditContext.showErrors
    const focus = recordEditContext.focus

    export let parentPath: DataRecordPathParentElement[]
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void

</script>

<DataRecordTable systemConfiguration={recordEditContext.systemConfiguration} record={$record} {model} {focus}
                 {parentPath} errors={$errors} showErrors={$showErrors}/>

{#each model.nestedModels as nestedModel}
    <h3>{nestedModel.name.value}</h3>
    {#if nestedModel.cardinality === 'one'}
        <NestedRecordEditor rootRecordEditContext={recordEditContext}
                            {nestedModel}
                            parentPath={[...parentPath, nestedModel]}
                            {pushContext}
                            {popContext}/>

    {:else}
        <NestedRecordArrayEditor
                {recordEditContext}
                {nestedModel}
                {parentPath}
                {pushContext}
                {popContext}/>
    {/if}
{/each}

