<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import { dataRecordEditor } from '@cozemble/data-editor-sdk'
    import { dataRecordEditEvents } from '@cozemble/model-event-sourced'
    import {type CurrencyProperty, currencyPropertyDescriptor} from "@cozemble/model-currency-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as CurrencyProperty
    // const propertyDescriptor = propertyDescriptors.mandatory(property)

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = currencyPropertyDescriptor.getRawValue(systemConfiguration, property, record) ?? null
    let editableValue = initialValue

    function currencyChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.valueAsNumber
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

    function validateInput(event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = target.value.replace(/[^0-9]/g, '');
    }
</script>

<input 
    class="input input-bordered" 
    type="number" 
    step="1"
    value={editableValue}
    on:input={validateInput}
    on:change={currencyChanged} />
