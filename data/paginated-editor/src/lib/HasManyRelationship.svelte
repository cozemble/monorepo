<script lang="ts">
    import type {DataRecordPathElement, HasManyRelationship,} from '@cozemble/model-core'
    import {dataRecordTableClicked} from './dataRecordTableClicked'
    import {modelFns} from '@cozemble/model-api'
    import DataRecordTableTd from './DataRecordTableTd.svelte'
    import {RecordEditContext, recordSaveSucceeded} from './RecordEditContext'
    import type {EventSourcedDataRecord} from '@cozemble/data-editor-sdk'
    import {dataRecordEditEvents, dataRecordEditor, eventSourcedDataRecordFns,} from '@cozemble/data-editor-sdk'

    export let recordEditContext: RecordEditContext
    export let parentPath: DataRecordPathElement[]
    export let relationship: HasManyRelationship
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void

    const models = recordEditContext.models
    const record = recordEditContext.record
    const errors = recordEditContext.errors
    const showErrors = recordEditContext.showErrors
    const focus = recordEditContext.focus

    const dataRecordEditorClient = dataRecordEditor.getClient()

    $: model = modelFns.findById(models, relationship.modelId)
    $: records = $record.values[relationship.id.value] ?? []

    async function onNewItemSaved(newRecord: EventSourcedDataRecord) {
        popContext()
        dataRecordEditorClient.dispatchEditEvent(
            dataRecordEditEvents.hasManyItemAdded(
                $record,
                parentPath,
                relationship,
                newRecord.record,
            ),
        )
        return recordSaveSucceeded(newRecord.record)
    }

    function addItem() {
        pushContext(
            new RecordEditContext(
                models,
                recordEditContext.saveNewRecord,
                eventSourcedDataRecordFns.newInstance(models, model.id, 'test-user'),
                onNewItemSaved,
                popContext,
                `New ${model.name.value}`,
            ),
        )
    }
</script>

<table
        on:click={(event) => dataRecordTableClicked(focus, event)}
        on:keyup={(event) => dataRecordTableClicked(focus, event)}
        class="table"
>
    <thead>
    <tr>
        {#each model.properties as property}
            <th>{property.name.value}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    {#each records as record}
        <tr>
            {#each model.properties as property}
                <DataRecordTableTd
                        {property}
                        {record}
                        {parentPath}
                        errors={$errors}
                        {focus}
                        showErrors={$showErrors}
                />
            {/each}
        </tr>
    {/each}
    </tbody>
</table>
<div class="bottom-buttons btn-group">
    <button type="button" on:click={addItem} class="btn btn-sm"
    >Add {model.name.value}</button
    >
</div>
