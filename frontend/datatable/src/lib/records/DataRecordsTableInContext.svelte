<script lang="ts">
    import type {
        Cardinality,
        DataRecord,
        DataRecordId,
        DataRecordPathParentElement,
        Model,
        ModelSlot,
    } from "@cozemble/model-core";
    import {dataRecordIdFns, propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "./helpers";
    import SlotTh from "./SlotTh.svelte";
    import DataTd from "./DataTd.svelte";
    import AddSubItemDialogue from "./AddSubItemDialogue.svelte";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {introductionsState} from "../stores/introductions";
    import ExpandCollapseButton from "./ExpandCollapseButton.svelte";
    import {writable} from "svelte/store";
    import {allEventSourcedModels} from "../stores/allModels";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import NestedDataRecordsInContext from "./NestedDataRecordsInContext.svelte";
    import WithSingleRecordContext from "./WithSingleRecordContext.svelte";
    import {tick} from "svelte";
    import {modelFns} from "@cozemble/model-api";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {contextHelper} from "../stores/contextHelper";

    export let oneOnly = false
    export let options: DataRecordsTableOptions = dataRecordsTableOptions(true, true, true)
    export let expandedRecordIds = writable([] as DataRecordId[])
    export let parentPath: DataRecordPathParentElement[] = []
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()
    const records = modelRecordsContextFns.getRecords()
    const focus = modelRecordsContextFns.getFocus()
    const focusControls = modelRecordsContextFns.getFocusControls()
    const dirtyRecords = modelRecordsContextFns.getDirtyRecords()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const modelControls = modelRecordsContextFns.getModelControls()
    const permitModelling = contextHelper.getPermitModelling()


    let slotBeingEdited: SlotBeingEdited | null = null
    let recordHavingSubItemAdded: string | null = null
    let addRecordButton: HTMLElement

    function beginSubItem(record: DataRecord) {
        recordHavingSubItemAdded = record.id.value
    }

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

    async function addNestedRecord(event: CustomEvent) {
        return addNestedModel(event.detail, "one")
    }

    async function addNestedTable(event: CustomEvent) {
        return addNestedModel(event.detail, "many")
    }

    function expandRecord(id: DataRecordId) {
        expandedRecordIds.update((ids: DataRecordId[]) => [...ids, id])
    }

    async function addNestedModel(child: Model, cardinality: Cardinality) {
        await modelControls.addNestedModel($eventSourcedModel, child, cardinality)
        if (recordHavingSubItemAdded) {
            expandRecord(dataRecordIdFns.newInstance(recordHavingSubItemAdded))
            recordHavingSubItemAdded = null
        }
    }

    function isDirtyRecord(dirtyRecordIds: DataRecordId[], record: DataRecord) {
        return dirtyRecordIds.some(dirtyRecordId => dirtyRecordId.value === record.id.value)
    }

    async function save(record: DataRecord, rootRecordIndex: number) {
        const outcome = await recordControls.saveRecord(record.id)
        if (outcome) {
            expandRecord(record.id)
        } else {
            focusControls.ensureNotFocusedOnRow(rootRecordIndex)
        }
    }

</script>


<table class="table table-compact">
    <thead>
    <tr>
        {#each $model.slots as slot, index}
            <SlotTh {slot} {index} {editSlot} permitModelEditing={options.permitModelEditing}/>
        {/each}
        {#if options.permitModelEditing && $permitModelling}
            <td class="bg-base-300 px-8">
                <div class="flex items-center">
                    <label tabindex="0" class="label m-1" on:click={addSlotToModel}>
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
            <WithSingleRecordContext {record} {rowIndex} let:rootRecordIndex={rootRecordIndex}>
                <tr>
                    {#each $model.slots as slot, colIndex}
                        {#if slot._type === 'property' || slot._type === 'model.reference'}
                            <DataTd {rowIndex} {colIndex} {record} modelSlot={slot}
                                    {parentPath}
                                    isFocused={$focus.isFocused(rootRecordIndex, parentPath, slot)}
                                    isEditing={$focus.isEditing} {focusControls}/>
                        {:else}
                            <td>To do: {slot._type}</td>
                        {/if}
                    {/each}
                    {#if options.permitModelEditing && $permitModelling}
                        <td class="border  border-base-300"></td>
                    {/if}
                    {#if options.showActions}
                        <td class="border  border-base-300">
                            <div class="flex items-center">
                                {#if isDirtyRecord($dirtyRecords, record)}
                                    <button class="btn btn-primary btn-sm  mr-2"
                                            on:click={() => save(record, rootRecordIndex)}>Save
                                    </button>
                                    <button class="btn btn-sm  mr-2" on:click={() => alert("to do")}>Cancel
                                    </button>
                                    <ExpandCollapseButton {expandedRecordIds} model={$model} {record}/>
                                {:else}
                                    <ExpandCollapseButton {expandedRecordIds} model={$model} {record}/>
                                    {#if !oneOnly}
                                        <button class="btn btn-ghost btn-active btn-sm  mr-2"
                                                on:click={() => alert("to do")}>
                                            Delete
                                        </button>
                                    {/if}
                                    {#if options.permitSubItemAddition && $permitModelling}
                                        <button class="btn btn-ghost btn-active btn-sm mr-2"
                                                on:click={() => beginSubItem(record)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 stroke-width="1.5"
                                                 stroke="currentColor" class="w-6 h-6">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="M12 4.5v15m7.5-7.5h-15"/>
                                            </svg>
                                            Add sub-section
                                        </button>
                                    {/if}
                                {/if}
                            </div>
                        </td>
                    {/if}
                </tr>
                {#if $expandedRecordIds.some(id => id.value === record.id.value)}
                    {#if $model.nestedModels.length > 0}
                        <tr>
                            <td class="border border-base-300" colspan={$model.slots.length + 2}>
                                <div class="nested-border p-3">
                                    {#each $model.nestedModels as nestedModel}
                                        <NestedDataRecordsInContext {record} {nestedModel} {options} {parentPath}/>
                                    {/each}
                                </div>
                            </td>
                        </tr>
                    {/if}
                {/if}
                {#if recordHavingSubItemAdded === record.id.value}
                    <tr>
                        <td class="border border-base-300" colspan={$model.slots.length + 2}>
                            <AddSubItemDialogue showIntro={$introductionsState.subItemsIntroduction === null}
                                                on:addNestedRecord={addNestedRecord}
                                                on:close={() => recordHavingSubItemAdded = null}
                                                on:addNestedTable={addNestedTable}/>
                        </td>
                    </tr>
                {/if}
            </WithSingleRecordContext>
        {/key}
    {/each}
    </tbody>
</table>

<div class="mt-2">
    {#if !oneOnly && $model.slots.length > 0}
        <button class="btn btn-primary" bind:this={addRecordButton} on:click={addRecord}>
            Add {$model.name.value}</button>
    {/if}
</div>


{#if slotBeingEdited}
    <SlotEditModal {slotBeingEdited}
                   on:close={() => slotBeingEdited = null} on:edited={modelEdited}/>
{/if}