<script lang="ts">
    import type {DataRecordPathParentElement,} from '@cozemble/model-core'
    import {modelFns} from '@cozemble/model-api'
    import DataRecordTable from './DataRecordTable.svelte'
    import HasManyRelationship from './HasManyRelationship.svelte'
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

<DataRecordTable record={$record} {model} {focus} {parentPath} errors={$errors} showErrors={$showErrors}/>

{#each model.nestedModels as nestedModel}
    {@const relatedModel = modelFns.findById(models, nestedModel.modelId)}
    <h3>{nestedModel.name.value}</h3>
    {#if nestedModel.cardinality === 'one'}
        <svelte:self
                {models}
                model={relatedModel}
                record={$record.values[nestedModel.id.value]}
                {errors}
                {showErrors}
                {focus}
                parentPath={[...parentPath, nestedModel]}/>
    {:else}
        <HasManyRelationship
                {recordEditContext}
                {nestedModel}
                {parentPath}
                {pushContext}
                {popContext}/>
    {/if}
{/each}
