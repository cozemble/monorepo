<script lang="ts">
    import type {NestedRecordsContext, RecordsContext} from "./RecordsContext";
    import type {Cardinality, DataRecord, DataRecordId, Model, ModelSlot, NestedModel} from "@cozemble/model-core";
    import {dataRecordIdFns, propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "./helpers";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {tick} from "svelte";
    import NestedDataRecords from "./NestedDataRecords.svelte";
    import AddSubItemDialogue from "./AddSubItemDialogue.svelte";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {introductionsState} from "../stores/introductions";
    import ExpandCollapseButton from "./ExpandCollapseButton.svelte";
    import {writable} from "svelte/store";
    import WithDataRecordEditorClient from "../models/WithDataRecordEditorClient.svelte";
    import {allEventSourcedModels} from "$lib/stores/allModels";
    import SlotTh from "$lib/records/cells/SlotTh.svelte";
    import DataTd from "$lib/records/cells/DataTd.svelte";

    export let context: RecordsContext
    export let oneOnly = false
    export let options: DataRecordsTableOptions = dataRecordsTableOptions(true, true, true)
    export let expandedRecordIds = writable([] as DataRecordId[])

    const allModels = context.allModels()
    const model = context.model()
    const records = context.records()
    const dirtyRecords = context.getDirtyRecords()
    const focus = context.getFocus()
    const focusControls = context.getFocusControls()
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
        slotBeingEdited = {modelList: allEventSourcedModels, model: $model, slot, anchorElement}
    }

    async function addSlotToModel() {
        const fieldName = `Field ${$model.model.slots.length + 1}`

        await context.updateModel(
            $model.model.id,
            propertyDescriptors
                .getDefault()
                .newProperty($systemConfiguration, $model.model.id, propertyNameFns.newInstance(fieldName)),
        )
        await tick()
        const element = document.querySelector(`th#field-${$model.model.slots.length}`) as HTMLElement
        if (element) {
            const slot = $model.model.slots[$model.model.slots.length - 1]
            slotBeingEdited = {modelList: allEventSourcedModels, model: $model, slot, anchorElement: element}
        }
    }

    async function modelEdited(event: CustomEvent) {
        const edited = event.detail.model
        await context.modelEdited(edited)
        slotBeingEdited = null
    }

    function addRecord() {
        throw new Error("Not implemented")
    }

    async function onNewRecordAdded(_event: CustomEvent) {
        throw new Error("Not implemented")
    }

    function makeNestedContext(record: DataRecord, nestedModel: NestedModel) {
        return context.nestedContext(record, nestedModel) as NestedRecordsContext
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

    async function addNestedModel(model: Model, cardinality: Cardinality) {
        await context.addNestedModel(model, cardinality)
        if (recordHavingSubItemAdded) {
            expandRecord(dataRecordIdFns.newInstance(recordHavingSubItemAdded))
            recordHavingSubItemAdded = null
        }
    }

    async function onNewRecordEdited(_event: CustomEvent) {
        throw new Error("Not implemented")
    }

    function isDirtyRecord(dirtyRecordIds: DataRecordId[], record: DataRecord) {
        return dirtyRecordIds.some(dirtyRecordId => dirtyRecordId.value === record.id.value)
    }
</script>


<table class="table">
    <thead>
    <tr>
        {#each $model.model.slots as slot, index}
            <SlotTh {slot} {index} {editSlot} permitModelEditing={options.permitModelEditing}/>
        {/each}
        {#if options.permitModelEditing}
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
        <WithDataRecordEditorClient {context} {record}>
            <tr>
                {#each $model.model.slots as slot, colIndex}
                    {#if slot._type === 'property' || slot._type === 'model.reference'}
                        <DataTd {rowIndex} {colIndex} {record} modelSlot={slot} rootRecordIndex={rowIndex}
                                parentPath={context.getDataRecordPathParentElements()}
                                isFocused={$focus.isFocused(rowIndex, context.getDataRecordPathParentElements(), slot)}
                                isEditing={$focus.isEditing} {focusControls}/>
                    {:else}
                        <td>To do: {slot._type}</td>
                    {/if}
                {/each}
                {#if options.permitModelEditing}
                    <td class="border  border-base-300"></td>
                {/if}
                {#if options.showActions}
                    <td class="border  border-base-300">
                        <div class="flex items-center">
                            {#if isDirtyRecord($dirtyRecords, record)}
                                <button class="btn btn-primary btn-sm  mr-2" on:click={() => alert("to do")}>Save
                                </button>
                                <button class="btn btn-sm  mr-2" on:click={() => alert("to do")}>Cancel
                                </button>
                                <ExpandCollapseButton {expandedRecordIds} model={$model.model} {record}/>
                            {:else}
                                <ExpandCollapseButton {expandedRecordIds} model={$model.model} {record}/>
                                {#if !oneOnly}
                                    <button class="btn btn-ghost btn-active btn-sm  mr-2"
                                            on:click={() => alert("to do")}>
                                        Delete
                                    </button>
                                {/if}
                                {#if options.permitSubItemAddition}
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
                {#if $model.model.nestedModels.length > 0}
                    <tr>
                        <td class="border border-base-300" colspan={$model.model.slots.length + 2}>
                            <div class="nested-border border border-2 p-3">
                                {#each $model.model.nestedModels as nestedModel}
                                    {@const nestedContext = makeNestedContext(record, nestedModel)}
                                    <NestedDataRecords {nestedContext} {options}/>
                                {/each}
                            </div>
                        </td>
                    </tr>
                {/if}
            {/if}
            {#if recordHavingSubItemAdded === record.id.value}
                <tr>
                    <td class="border border-base-300" colspan={$model.model.slots.length + 2}>
                        <AddSubItemDialogue showIntro={$introductionsState.subItemsIntroduction === null}
                                            on:addNestedRecord={addNestedRecord} on:addNestedTable={addNestedTable}/>
                    </td>
                </tr>
            {/if}
        </WithDataRecordEditorClient>
    {/each}
    </tbody>
</table>

<div class="mt-2">
    {#if !oneOnly && $model.model.slots.length > 0}
        <button class="btn btn-primary" bind:this={addRecordButton} on:click={addRecord}>
            Add {$model.model.name.value}</button>
    {/if}
</div>


{#if slotBeingEdited}
    <SlotEditModal {slotBeingEdited}
                   on:close={() => slotBeingEdited = null} on:edited={modelEdited}/>
{/if}
