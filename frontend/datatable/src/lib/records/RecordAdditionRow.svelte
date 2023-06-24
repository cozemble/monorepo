<script lang="ts">
    import DataEntryRow from "$lib/records/entry/DataEntryRow.svelte";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import type {DataRecord, DataRecordId, DataRecordPathParentElement} from "@cozemble/model-core";
    import type {DataRecordsTableOptions} from "$lib/records/DataRecordsTableOptions";
    import type {Writable} from "svelte/store";
    import {collapseRecord, expandLastRow, expandRecord, flashRow} from "$lib/records/expandCollapse";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced";
    import {mandatory} from "@cozemble/lang-util";

    export let colspan: number
    export let parentPath: DataRecordPathParentElement[]
    export let options: DataRecordsTableOptions
    export let record: DataRecord
    export let rowIndex: number
    export let expandedRecordIds: Writable<DataRecordId[]>

    const records = modelRecordsContextFns.getRecords()
    const model = modelRecordsContextFns.getModel()
    const eventSourcedRecords = modelRecordsContextFns.getEventSourcedRecordGraph()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const focusControls = modelRecordsContextFns.getFocusControls()

    async function saveNewRecord(record: DataRecord, rootRecordIndex: number) {
        const isExpanded = $expandedRecordIds.find(x => x.value === record.id.value)
        const outcome = await recordControls.saveNewRecord(record.id)
        if (outcome) {
            expandRecord(expandedRecordIds, record.id)
        } else {
            collapseRecord(expandedRecordIds, record.id)
            focusControls.ensureNotFocusedOnRow(rootRecordIndex)
            flashRow($records.length - 2)
            if (isExpanded) {
                expandLastRow(expandedRecordIds, $records)
            }
        }
    }

    function recordHasEvents(rowIndex: number, graph: EventSourcedRecordGraph) {
        const records = graph.records
        return mandatory(records[rowIndex], `No event sourced record at index ${rowIndex}`).events.length > 0
    }

</script>

{#if $records.length > 1}
    <tr class="bg-accent">
        <td {colspan} class="bg-base-300 w-full text-xs">
            <div>Add next record below</div>
        </td>
    </tr>
{/if}
<DataEntryRow {parentPath} {options} {record} {rowIndex} oneOnly={true} {expandedRecordIds} extraClasses="record-addition-row"/>
{#if recordHasEvents(rowIndex, $eventSourcedRecords)}
    <tr>
        <td {colspan}>
            <div class="flex justify-center">
                <button class="btn btn-primary save-root-record"
                        on:click={() => saveNewRecord(record,($records.length - 1))}>
                    Save {$model.name.value}</button>
                <button class="btn btn-secondary ml-2">Clear</button>
            </div>
        </td>
    </tr>
{/if}
