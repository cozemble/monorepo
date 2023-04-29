<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {IntegerProperty} from "@cozemble/model-integer-core";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as IntegerProperty

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const initialValue = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
    let editableValue = initialValue

    function integerChanged(event: Event) {
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
</script>

<input class="input input-bordered" type="number" step="1" value={editableValue} on:change={integerChanged}/>
