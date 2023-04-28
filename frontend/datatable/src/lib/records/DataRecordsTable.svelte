<script lang="ts">
    import type {RootRecordsContext} from "./RecordsContext";
    import type {DataRecord, ModelSlot, SystemConfiguration} from "@cozemble/model-core";
    import {propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {RecordBeingAdded, SlotBeingEdited} from "./helperTypes";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {tick} from "svelte";
    import NestedDataRecords from "./NestedDataRecords.svelte";
    import RecordBeingAddedModal from "./RecordBeingAddedModal.svelte";
    import SlotTh from "./SlotTh.svelte";
    import DataTd from "./DataTd.svelte";
    import AddSubItemDialogue from "./AddSubItemDialogue.svelte";
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {dataRecordsTableOptions} from "./DataRecordsTableOptions";
    import {systemConfiguration} from "../stores/systemConfiguration";

    export let context: RootRecordsContext
    export let oneOnly = false
    export let options: DataRecordsTableOptions = dataRecordsTableOptions(true, true, true)
    export let expandedRecordId: string | null = null

    const allEventSourcedModels = context.allEventSourcedModels()
    const allModels = context.allModels()
    const model = context.model()
    const records = context.records()
    let slotBeingEdited: SlotBeingEdited | null = null
    let recordBeingAdded: RecordBeingAdded | null = null
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
        slotBeingEdited = {models: $allEventSourcedModels, model: $model, slot, anchorElement}
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
            slotBeingEdited = {models: $allEventSourcedModels, model: $model, slot, anchorElement: element}
        }
    }

    async function modelEdited(event: CustomEvent) {
        const edited = event.detail.model
        await context.modelEdited(edited)
        slotBeingEdited = null
    }

    function toggleRecordExpand(record: DataRecord) {
        if (expandedRecordId === record.id.value) {
            expandedRecordId = null
        } else {
            expandedRecordId = record.id.value
        }
    }

    function addRecord() {
        recordBeingAdded = {models: $allModels, model: $model.model, anchorElement: addRecordButton}
    }

    async function onNewRecordAdded(_event: CustomEvent) {
        recordBeingAdded = null
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
    {#each $records.records as record, rowIndex}
        <tr>
            {#each $model.model.slots as slot, colIndex}
                {#if slot._type === 'property' || slot._type === 'model.reference'}
                    <DataTd {rowIndex} {colIndex} {record} modelSlot={slot} />
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
                        {#if $model.model.nestedModels.length > 0}
                            <button class="btn btn-ghost btn-active btn-sm mr-2"
                                    on:click={() => toggleRecordExpand(record)}>
                                {#if expandedRecordId === record.id.value}
                                    Collapse
                                {:else}
                                    Expand
                                {/if}
                            </button>
                        {/if}
                        {#if !oneOnly}
                            <button class="btn btn-ghost btn-active btn-sm  mr-2" on:click={() => alert("to do")}>Delete
                            </button>
                        {/if}
                        {#if options.permitSubItemAddition}
                            <button class="btn btn-ghost btn-active btn-sm mr-2" on:click={() => beginSubItem(record)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     stroke-width="1.5"
                                     stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                                </svg>
                                Add sub-item
                            </button>
                        {/if}
                    </div>
                </td>
            {/if}
        </tr>
        {#if expandedRecordId === record.id.value}
            {#if $model.model.nestedModels.length > 0}
                <tr>
                    <td class="border border-base-300" colspan={$model.model.slots.length + 2}>
                        <div class="nested-border border border-2 p-3">
                            {#each $model.model.nestedModels as nestedModel}
                                {@const nestedContext = context.nestedContext(nestedModel)}
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
                    <AddSubItemDialogue/>
                </td>
            </tr>
        {/if}
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
{#if recordBeingAdded}
    <RecordBeingAddedModal recordsContext={context} {recordBeingAdded} on:added={onNewRecordAdded}
                           on:cancel={() => recordBeingAdded = null}/>
{/if}