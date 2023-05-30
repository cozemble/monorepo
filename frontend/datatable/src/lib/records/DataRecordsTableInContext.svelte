<script lang="ts">
    import type {DataRecord, DataRecordId, DataRecordPathParentElement, ModelSlot,} from "@cozemble/model-core";
    import {propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "./helpers";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {writable} from "svelte/store";
    import {allEventSourcedModels} from "../stores/allModels";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {tick} from "svelte";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {contextHelper} from "../stores/contextHelper";
    import DataEntryRow from "./entry/DataEntryRow.svelte";
    import AddModelElementButton from "./modelling/AddModelElementButton.svelte";
    import {modelFns, modelOptions, propertyFns} from "@cozemble/model-api";
    import {mandatory} from "@cozemble/lang-util";
    import SlotTh from "$lib/records/cells/SlotTh.svelte";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced";
    import RecordAdditionRow from "$lib/records/RecordAdditionRow.svelte";
    import {expandLastRow} from "$lib/records/expandCollapse";

    export let oneOnly = false
    export let options: DataRecordsTableOptions = dataRecordsTableOptions(true, true, true)
    export let expandedRecordIds = writable([] as DataRecordId[])
    export let parentPath: DataRecordPathParentElement[] = []
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()
    const records = modelRecordsContextFns.getRecords()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const modelControls = modelRecordsContextFns.getModelControls()
    const dirtyRecords = modelRecordsContextFns.getDirtyRecords()
    const nestedModelBeingEdited = modelRecordsContextFns.getNestedModelBeingEdited()
    const permitModelling = contextHelper.getPermitModelling()
    const permitRecordAdditions = modelRecordsContextFns.getPermitRecordAdditions()

    let slotBeingEdited: SlotBeingEdited | null = null

    function editSlot(clicked: Event, slot: ModelSlot) {
        const anchorElement = (clicked.target as HTMLElement).closest('th')
        if (!anchorElement) {
            return
        }
        slotBeingEdited = {modelList: allEventSourcedModels, model: $eventSourcedModel, slot, anchorElement}
    }

    async function addInnerTable() {
        const nestedModelId = await modelControls.addNestedModel($eventSourcedModel, modelFns.newInstance('Inner table', modelOptions.withSlot(propertyFns.newInstance("Field 1"))), "many")
        await tick()
        expandLastRow(expandedRecordIds,$records)
        nestedModelBeingEdited.set(nestedModelId)
    }

    async function addInnerRecord() {
        const nestedModelId = await modelControls.addNestedModel($eventSourcedModel, modelFns.newInstance('Inner record', modelOptions.withSlot(propertyFns.newInstance("Field 1"))), "one")
        await tick()
        expandLastRow(expandedRecordIds,$records)
        nestedModelBeingEdited.set(nestedModelId)
    }

    async function addSlotToModel() {
        const fieldName = `Field ${$model.slots.length + 1}`

        await modelControls.updateModel(
            $model.id,
            propertyDescriptors
                .getDefault()
                .newProperty($systemConfiguration, $model.id, propertyNameFns.newInstance(fieldName)),
        )
        await tick()
        const element = document.querySelector(`th#field-${$model.slots.length}`) as HTMLElement
        if (element) {
            const slot = $model.slots[$model.slots.length - 1]
            slotBeingEdited = {
                modelList: allEventSourcedModels,
                model: $eventSourcedModel,
                slot,
                anchorElement: element
            }
        }
    }

    async function modelEdited() {
        slotBeingEdited = null
    }

    function isDirtyRecord(record: DataRecord, dirtyRecords: DataRecordId[]) {
        return dirtyRecords.some(x => x.value === record.id.value)
    }

    function onSaveExistingRecord(recordId: DataRecordId) {
        recordControls.saveRecord(recordId)
    }

    $: hasModellingColumn = options.permitModelEditing && $permitModelling
    $: colspan = $model.slots.length + (hasModellingColumn ? 1 : 0) + (options.showActions ? 1 : 0)
</script>


<table class="table table-compact">
    <thead>
    <tr>
        {#each $model.slots as slot, index}
            <SlotTh {slot} {index} {editSlot} permitModelEditing={options.permitModelEditing}/>
        {/each}
        {#if hasModellingColumn}
            <td class="bg-base-300 px-8">
                <div class="flex items-center">
                    <AddModelElementButton {addSlotToModel} {addInnerTable} {addInnerRecord}/>
                </div>
            </td>
        {/if}
        {#if options.showActions}
            <td class="bg-base-300">Actions</td>
        {/if}
    </tr>
    </thead>
    <tbody>
    {#each $records as record, rowIndex}
        {#key record.id.value}
            {#if rowIndex === ($records.length - 1) && parentPath.length === 0}
                {#if $permitRecordAdditions}
                    <RecordAdditionRow {colspan} {parentPath} {options} {rowIndex} {expandedRecordIds} {record}/>
                {/if}
            {:else}
                <DataEntryRow {parentPath} {options} {record} {rowIndex} {oneOnly} {expandedRecordIds}/>
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
            {/if}
        {/key}
    {/each}
    </tbody>
</table>


{#if slotBeingEdited}
    <SlotEditModal {slotBeingEdited}
                   on:close={() => slotBeingEdited = null} on:edited={modelEdited}/>
{/if}