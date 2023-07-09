<script lang="ts">
    import type {
        DataRecord,
        DataRecordValuePath,
        LeafModelSlot,
        Property,
        SystemConfiguration
    } from '@cozemble/model-core'
    import {propertyDescriptors} from "@cozemble/model-core";
    import {slotEditorRegistry} from '@cozemble/model-registries'
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {dataRecordControlEvents, dataRecordEditEvents} from "@cozemble/model-event-sourced";
    import type {EditingControlEvent} from "@cozemble/model-properties-ui";
    import {isEditingControlEvent} from "@cozemble/model-properties-ui";

    export let modelSlot: LeafModelSlot
    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = modelSlot as Property
    const propertyDescriptor = propertyDescriptors.mandatory(property)
    const dataRecordEditorClient = dataRecordEditor.getClient()

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
    $: editor = slotEditorRegistry.forSlot(modelSlot)

    function closeHandler() {
        dataRecordEditorClient.dispatchControlEvent(
            dataRecordControlEvents.editAborted(record, recordPath),
        )
    }

    function getTerminatingKey(submitEvent: EditingControlEvent | KeyboardEvent | null): {
        terminatingKey: 'Enter' | 'Tab' | null,
        shiftKeyPressed: boolean
    } {
        if (isEditingControlEvent(submitEvent)) {
            if (submitEvent.type === 'editingFinished') {
                return {
                    terminatingKey: 'Enter',
                    shiftKeyPressed: false,
                }
            } else if (submitEvent.type === 'editingCancelled') {
                return {
                    terminatingKey: null,
                    shiftKeyPressed: false,
                }
            }
        }
        submitEvent = submitEvent as KeyboardEvent
        if (submitEvent && (submitEvent.key === 'Tab' || submitEvent.key === 'Enter')) {
            return {
                terminatingKey: submitEvent.key,
                shiftKeyPressed: submitEvent.shiftKey,
            }
        }
        return {
            terminatingKey: null,
            shiftKeyPressed: false,
        }
    }

    function changeHandler(newValue: any | null, event: EditingControlEvent | KeyboardEvent | null) {
        const {terminatingKey, shiftKeyPressed} = getTerminatingKey(event)
        if (newValue !== value) {
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    value,
                    newValue,
                    null,
                ),
            )
        }
        if (terminatingKey === 'Tab') {
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.moveFocus(record, recordPath, shiftKeyPressed ? 'left' : 'right'),
            )
        }
        if (terminatingKey === 'Enter') {
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.editAborted(record, recordPath),
            )
        }
    }
</script>

{#if editor}
    <svelte:component
            this={editor}
            {value}
            {property}
            {changeHandler}
            {closeHandler}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
