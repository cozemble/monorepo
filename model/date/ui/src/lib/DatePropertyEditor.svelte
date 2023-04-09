<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {DateProperty} from "@cozemble/model-date-core";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const property = recordPath.lastElement as DateProperty

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
                    null
                ),
            )
        }
    }
</script>

<input class="input input-bordered" type="date" value={editableValue} on:change={dateChanged}/>

