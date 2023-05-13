<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {propertyDescriptors} from "@cozemble/model-core";
    import {dataRecordEditEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import type {DecimalProperty} from "@cozemble/model-decimal-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as DecimalProperty
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
    $: numberOfDecimalPlaces = property.numberOfDecimalPlaces

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
    let editableValue = initialValue

    function decimalChanged(event: Event) {
        const target = event.target as HTMLInputElement
        let newValue = parseFloat(target.value) as number | null

        if (newValue === null || isNaN(newValue)) {
            newValue = null
        }

        if (newValue !== editableValue) {
            editableValue = newValue
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    initialValue,
                    newValue,
                    null
                ),
            )
        }
    }

    function validateInput(event: KeyboardEvent) {
        const target = event.target as HTMLInputElement
        const decimalPart = target.value.split('.')[1] || ''

        // Check if selectionStart is null and provide a default value of 0
        const selectionStart = target.selectionStart ?? 0;

        // allow metaKey combinations (like CMD+A, CMD+C, etc.), and functional keys like Tab, Enter, Escape, arrow keys, Home, End, PageUp, PageDown, and Insert
        if (event.metaKey || ['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Insert'].includes(event.key)) return;

        // check if the pressed key was not a number, and not a decimal or control key, or if the decimal part is already at maximum length
        if ((isNaN(Number(event.key)) && event.key !== '.' && !['Backspace', 'Delete'].includes(event.key))
            || (event.key === '.' && target.value.includes('.'))
            || (decimalPart.length >= numberOfDecimalPlaces && !isNaN(Number(event.key)) && selectionStart > target.value.indexOf('.'))) {
            event.preventDefault()
        }
    }

    function validatePaste(event: Event) {
        const target = event.target as HTMLInputElement;
        const decimalPart = target.value.split('.')[1] || '';
        if(decimalPart.length > numberOfDecimalPlaces) {
            target.value = target.value.slice(0, target.value.indexOf('.') + numberOfDecimalPlaces + 1);
        }
    }

</script>

<input
        class="input input-bordered"
        type="text"
        value={editableValue}
        on:input={validatePaste}
        on:keydown={validateInput}
        on:change={decimalChanged}/>
