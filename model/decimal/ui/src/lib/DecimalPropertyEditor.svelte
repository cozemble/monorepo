<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordEditEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import type {DecimalProperty} from "@cozemble/model-decimal-core";
    import {propertyDescriptors} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as DecimalProperty
    const numberOfDecimalPlaces = property.numberOfDecimalPlaces
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
    let editableValue = initialValue
    let input: HTMLInputElement

    function decimalChanged(event: Event) {
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

    function validateInput() {
        input.value = input.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/(\.[0-9]{2})./g, '$1');
    }    

</script>
<!--
<input 
    class="input input-bordered" 
    type="number"
    value={editableValue}
    bind:this={input}
    on:input={validateInput}
    on:change={decimalChanged}/>
-->    
<input
    class="input input-bordered"
    type="number"
    value={editableValue}
    on:change={decimalChanged}/>
