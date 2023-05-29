<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {propertyDescriptors} from "@cozemble/model-core";
    import {dataRecordEditor} from '@cozemble/data-editor-sdk'
    import type {DateProperty} from "@cozemble/model-date-core";
    import {dataRecordControlEvents, dataRecordEditEvents} from "@cozemble/model-event-sourced";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    export let inRecord = true

    const property = recordPath.lastElement as DateProperty
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
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

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null

    function handleKeyDownInInput(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.editAborted(record, recordPath),
            )
        }
        if (event.key === 'Tab') {
            event.preventDefault()
            event.stopPropagation()
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.moveFocus(record, recordPath, event.shiftKey ? 'left' : 'right'),
            )
        }
    }
</script>
{#if inRecord}
    {#if value}
        {value}
    {:else}
        &nbsp;
    {/if}
{/if}

<div class="input-container" class:absolute={inRecord}>
    <input class="input input-bordered date-input" type="date" value={editableValue} on:change={dateChanged} use:init
           on:keydown={handleKeyDownInInput}/>
</div>

<style>
    .absolute {
        position: absolute;
    }
</style>