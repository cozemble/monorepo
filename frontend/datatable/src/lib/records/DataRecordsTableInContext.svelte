<script lang="ts">
    import type {DataRecord, DataRecordId, DataRecordPathParentElement, ModelSlot,} from "@cozemble/model-core";
    import {propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "./helpers";
    import SlotTh from "./SlotTh.svelte";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {writable} from "svelte/store";
    import {allEventSourcedModels} from "../stores/allModels";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {tick} from "svelte";
    import {modelFns} from "@cozemble/model-api";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {contextHelper} from "../stores/contextHelper";
    import DataEntryRow from "./entry/DataEntryRow.svelte";

    export let oneOnly = false
    export let options: DataRecordsTableOptions = dataRecordsTableOptions(true, true, true)
    export let expandedRecordIds = writable([] as DataRecordId[])
    export let parentPath: DataRecordPathParentElement[] = []
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()
    const records = modelRecordsContextFns.getRecords()
    const focus = modelRecordsContextFns.getFocus()
    const focusControls = modelRecordsContextFns.getFocusControls()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const modelControls = modelRecordsContextFns.getModelControls()
    const permitModelling = contextHelper.getPermitModelling()

    let slotBeingEdited: SlotBeingEdited | null = null
    let addRecordButton: HTMLElement

    function editSlot(clicked: Event, slot: ModelSlot) {
        const anchorElement = (clicked.target as HTMLElement).closest('th')
        if (!anchorElement) {
            return
        }
        slotBeingEdited = {models: $allEventSourcedModels, model: $eventSourcedModel, slot, anchorElement}
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
            slotBeingEdited = {models: $allEventSourcedModels, model: $eventSourcedModel, slot, anchorElement: element}
        }
    }

    async function modelEdited(event: CustomEvent) {
        const edited = event.detail.model
        await modelControls.modelEdited(edited)
        slotBeingEdited = null
    }

    async function addRecord() {
        expandRecord(recordControls.addNewRecord())
        await tick()
        const lastRowIndex = $records.length - 1
        const firstEditableSlot = modelFns.leafSlots($model)[0]
        if (firstEditableSlot) {
            focusControls.setFocus(lastRowIndex, firstEditableSlot, [])
            focusControls.beginEditing()
        }
    }

    function expandRecord(id: DataRecordId) {
        expandedRecordIds.update((ids: DataRecordId[]) => [...ids, id])
    }

    function collapseRecord(id: DataRecordId) {
        expandedRecordIds.update((ids: DataRecordId[]) => ids.filter(x => x.value !== id.value))
    }

    function flashRow(rowIndex: number) {
        const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`) as HTMLElement
        const extraClasses = ['border', 'border-primary', 'border-4']
        if (row) {
            for (const extraClass of extraClasses) {
                row.classList.add(extraClass)
            }
            setTimeout(() => {
                for (const extraClass of extraClasses) {
                    row.classList.remove(extraClass)
                }
            }, 1000)
        }
    }

    async function save(record: DataRecord, rootRecordIndex: number) {
        const isExpanded = $expandedRecordIds.find(x => x.value === record.id.value)
        const outcome = await recordControls.saveNewRecord(record.id)
        if (outcome) {
            expandRecord(record.id)
        } else {
            collapseRecord(record.id)
            focusControls.ensureNotFocusedOnRow(rootRecordIndex)
            flashRow($records.length - 2)
            if (isExpanded) {
                expandRecord($records[$records.length - 1].id)
            }
        }
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
                    <label tabindex="0" class="label m-1 add-field" on:click={addSlotToModel}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        <span class="ml-2">Add Field</span>
                    </label>
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
                {#if $records.length > 0}
                    <tr class="bg-accent">
                        <td {colspan}  class="bg-base-200 w-full text-xs">
                            <div class="w-ful">Add next record below</div>
                        </td>
                    </tr>
                {/if}

                <DataEntryRow {parentPath} {options} {record} {rowIndex} {oneOnly} {expandedRecordIds}/>
                <tr>
                    <td {colspan}>
                        <div class="flex justify-center">
                            <button class="btn btn-primary" on:click={() => save(record,($records.length - 1))}>Save
                                new {$model.name.value}</button>
                            <button class="btn btn-secondary ml-2">Clear</button>
                        </div>
                    </td>
                </tr>
            {:else}
                <DataEntryRow {parentPath} {options} {record} {rowIndex} {oneOnly} {expandedRecordIds}/>
            {/if}
        {/key}
    {/each}
    </tbody>
</table>

<!--<div class="mt-2">-->
<!--    {#if !oneOnly && $model.slots.length > 0}-->
<!--        <button class="btn btn-primary add-record" bind:this={addRecordButton} on:click={addRecord}>-->
<!--            Add {$model.name.value}</button>-->
<!--    {/if}-->
<!--</div>-->


{#if slotBeingEdited}
    <SlotEditModal {slotBeingEdited}
                   on:close={() => slotBeingEdited = null} on:edited={modelEdited}/>
{/if}