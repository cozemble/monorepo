<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordEditEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration


    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
    let editableValue = initialValue

    function dateChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.value
        if (newValue !== editableValue) {
            editableValue = newValue
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    initialValue,
                    newValue,
                    "Tab"
                ),
            )
        }
    }

    function init(el: HTMLInputElement) {
        el.focus()
    }

    $: value = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
</script>
{#if value}
    {value}
{:else}
    &nbsp;
{/if}


<div class="input-container">
    <input class="input input-bordered" type="date" value={editableValue} on:change={dateChanged} use:init/>
</div>

<style>
    .input-container {
        position: absolute;
    }
</style>