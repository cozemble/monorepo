<script lang="ts">
    import type {DataRecordPathElement,} from '@cozemble/model-core'
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

    export let parentPath: DataRecordPathElement[]
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void
</script>

<DataRecordTable record={$record} {model} {focus} {parentPath} errors={$errors} showErrors={$showErrors}/>

{#each model.relationships as relationship}
    {@const relatedModel = modelFns.findById(models, relationship.modelId)}
    <h3>{relationship.name.value}</h3>
    {#if relationship.subType === 'has.one.relationship'}
        <svelte:self
                {models}
                model={relatedModel}
                record={$record.values[relationship.id.value]}
                {errors}
                {showErrors}
                {focus}
                parentPath={[...parentPath, relationship]}/>
    {:else}
        <HasManyRelationship
                {recordEditContext}
                {relationship}
                {parentPath}
                {pushContext}
                {popContext}/>
    {/if}
{/each}
