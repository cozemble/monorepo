<script lang="ts">
    import type {RecordsContext} from "./RecordsContext";
    import type {ModelSlot} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "./helperTypes";
    import SlotEditModal from "./SlotEditModal.svelte";
    import {propertyDescriptors} from "@cozemble/model-core";
    import {propertyNameFns} from "@cozemble/model-core";

    export let context: RecordsContext
    export let oneOnly = false
    const model = context.model
    const records = context.records
    let slotBeingEdited: SlotBeingEdited | null = null

    function editSlot(clicked: Event, slot: ModelSlot) {
        const anchorElement = (clicked.target as HTMLElement).closest('th')
        if (!anchorElement) {
            return
        }
        slotBeingEdited = {slot, anchorElement}
        // editFieldRelativeToAnchor(anchorElement, field)
    }

    async function addSlotToModel() {
        const fieldName = `Field ${$model.model.slots.length + 1}`

        await context.updateModel(
            $model.model.id,
            propertyDescriptors
                .getDefault()
                .newProperty(context.systemConfiguration, $model.model.id, propertyNameFns.newInstance(fieldName)),
        )
    }


</script>


<table class="table">
    <thead>
    <tr>
        {#each $model.model.slots as slot, index}
            <th class="bg-base-300" id="field-{index + 1}">
                <div class="flex items-center"><span class="mr-1">{slot.name.value}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="w-6 h-6" on:click={(elem) => editSlot(elem,slot)}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
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
    </tbody>
</table>

{#if slotBeingEdited}
    <SlotEditModal {slotBeingEdited} on:close={() => slotBeingEdited = null}/>
{/if}