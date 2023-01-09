<script lang="ts">
    import type {DataRecord, Model} from '@cozemble/model-core'
    import type {CellFocus} from '$lib/CellFocus'
    import type {Writable} from 'svelte/store'
    import DataTd from '$lib/DataTd.svelte'
    import {modelFns} from '@cozemble/model-api'
    import {adjustFocusFollowingValueChange, applyValueChangedToRecord} from '$lib/onValueChanged'
    import type {DataRecordEditEvent, DataRecordEditorClient,} from '@cozemble/model-editor-sdk'
    import {dataRecordEditorHost} from '@cozemble/model-editor-sdk'
    import {createEventDispatcher} from 'svelte'

    export let models: Model[]
    export let model: Model
    export let focus: Writable<CellFocus | null>
    export let rowIndex: number
    export let record: DataRecord
    const dispatch = createEventDispatcher()
    let showErrors = false

    function saveRecord() {
        const errors = modelFns.validate(models, record)
        if (errors.size > 0) {
            showErrors = true
        }
    }

    function cancel() {
        dispatch('cancel')
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchEditEvent(event: DataRecordEditEvent): void {
            if (event._type === 'data.record.value.changed') {
                record = applyValueChangedToRecord(models, record, event)
                adjustFocusFollowingValueChange(event, focus)
            }
            if (event._type === 'data.record.edit.aborted') {
                focus.set(null)
            }
        },
    }
    dataRecordEditorHost.setClient(dataRecordEditorClient)
</script>

<tr>
    {#each model.properties as property, colIndex}
        <DataTd {focus} {rowIndex} {colIndex} {record} {property} {showErrors}/>
    {/each}
    <td>
        <button type="button" class="save" on:click={saveRecord}>Save</button>
        <button type="button" class="cancel" on:click={cancel}>Cancel</button>
    </td>
</tr>

<style>
    td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>
