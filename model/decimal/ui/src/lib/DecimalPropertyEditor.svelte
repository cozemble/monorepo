<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {DecimalProperty} from "@cozemble/model-decimal-core";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as DecimalProperty
    const numberOfDecimalPlaces = property.numberOfDecimalPlaces

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
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

<input 
    class="input input-bordered" 
    type="number"
    value={editableValue}
    bind:this={input}
    on:input={validateInput}
    on:change={decimalChanged}/>
