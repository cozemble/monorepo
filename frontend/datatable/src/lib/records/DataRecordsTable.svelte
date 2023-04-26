<script lang="ts">
    import type {RecordsContext} from "./RecordsContext";
    import type {DataRecord, ModelSlot, NestedModel} from "@cozemble/model-core";
    import {propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "./helperTypes";
    import {ensureNestedRecords} from "./helperTypes";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {tick} from "svelte";
    import DownCaret from "../icons/DownCaret.svelte";
    import {currentUserId} from "../stores/currentUserId";
    import NestedDataRecords from "./NestedDataRecords.svelte";

    export let context: RecordsContext
    export let oneOnly = false
    export let permitSubItemAddition = true

    const allModels = context.allModels
    const model = context.model
    const records = context.records
    let slotBeingEdited: SlotBeingEdited | null = null
    let expandedRecordId: string | null = null
    let recordHavingSubItemAdded: string | null = null

    function beginSubItem(record: DataRecord) {
        recordHavingSubItemAdded = record.id.value
    }

    function editSlot(clicked: Event, slot: ModelSlot) {
        const anchorElement = (clicked.target as HTMLElement).closest('th')
        if (!anchorElement) {
            return
        }
        slotBeingEdited = {models: $allModels, model: $model, slot, anchorElement}
    }

    async function addSlotToModel() {
        const fieldName = `Field ${$model.model.slots.length + 1}`

        await context.updateModel(
            $model.model.id,
            propertyDescriptors
                .getDefault()
                .newProperty(context.systemConfiguration, $model.model.id, propertyNameFns.newInstance(fieldName)),
        )
        await tick()
        const element = document.querySelector(`th#field-${$model.model.slots.length}`) as HTMLElement
        if (element) {
            const slot = $model.model.slots[$model.model.slots.length - 1]
            slotBeingEdited = {models: $allModels, model: $model, slot, anchorElement: element}
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

    function onEnsureNestedRecords(record: DataRecord, nestedModel: NestedModel): DataRecord {
        return ensureNestedRecords($currentUserId, $model.model, record, nestedModel)
    }

    function addRecord() {

    }
</script>


<table class="table">
    <thead>
    <tr>
        {#each $model.model.slots as slot, index}
            <th class="bg-base-300" id="field-{index + 1}">
                <div class="flex items-center"><span class="mr-1">{slot.name.value}</span>
                    <span class="mt-1" on:click={(elem) => editSlot(elem,slot)}><DownCaret/></span>
                </div>
            </th>
        {/each}
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
        <td class="bg-base-300">Actions</td>
    </tr>
    </thead>
    <tbody>
    {#each $records.records as record}
        <tr>
            {#each $model.model.slots as slot}
                <td class="border">
                    <input type="text" class="input input-bordered w-full" bind:value={record.values[slot.id.value]}/>
                </td>
            {/each}
            <td class="border"></td>
            <td class="border">
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
                    {#if permitSubItemAddition}
                        <button class="btn btn-ghost btn-active btn-sm mr-2" on:click={() => beginSubItem(record)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                 stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                            </svg>
                            Add sub-item
                        </button>
                    {/if}
                </div>
            </td>
        </tr>
        {#if expandedRecordId === record.id.value}
            {#if $model.model.nestedModels.length > 0}
                <tr>
                    <td class="border" colspan={$model.model.slots.length + 2}>
                        <div class="nested-border border border-2 p-3">
                            {#each $model.model.nestedModels as nestedModel}
                                {@const nestedContext = context.nestedContext(nestedModel)}
                                <NestedDataRecords {nestedContext} />
                            {/each}
                        </div>
                    </td>
                </tr>
            {:else}
                <tr>
                    <td class="border" colspan={$model.model.slots.length + 2}>
                        Add sub part to do
                    </td>
                </tr>
            {/if}
        {/if}
    {/each}
    </tbody>
</table>

<div class="mt-2">
    {#if !oneOnly && $model.model.slots.length > 0}
        <button class="btn btn-primary" on:click={addRecord}>Add {$model.model.name.value}</button>
    {/if}
</div>


{#if slotBeingEdited}
    <SlotEditModal systemConfiguration={context.systemConfiguration} {slotBeingEdited}
                   on:close={() => slotBeingEdited = null} on:edited={modelEdited}/>
{/if}