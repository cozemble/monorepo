<script lang="ts">
    import type {DataRecord, DataRecordId, DataRecordPathParentElement} from "@cozemble/model-core";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";

    export let record: DataRecord
    export let parentPath: DataRecordPathParentElement[]
    export let colspan: number

    const dirtyRecords = modelRecordsContextFns.getDirtyRecords()
    const model = modelRecordsContextFns.getModel()
    const recordControls = modelRecordsContextFns.getRecordControls()

    function isDirtyRecord(record: DataRecord, dirtyRecords: DataRecordId[]) {
        return dirtyRecords.some(x => x.value === record.id.value)
    }

    function onSaveExistingRecord(recordId: DataRecordId) {
        recordControls.saveRecord(recordId)
    }
</script>

{#if isDirtyRecord(record, $dirtyRecords) && parentPath.length === 0}
    <tr>
        <td {colspan}>
            <div class="flex justify-center">
                <button class="btn btn-primary save-root-record"
                        on:click={() => onSaveExistingRecord(record.id)}>
                    Save {$model.name.value}</button>
                <button class="btn btn-secondary ml-2" on:click={() => alert("to do")}>Cancel</button>
            </div>
        </td>
    </tr>
{/if}
