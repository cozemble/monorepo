<script lang="ts">
    import {expandLastRow} from "$lib/records/expandCollapse";
    import {systemConfiguration} from "$lib/stores/systemConfiguration";
    import {allEventSourcedModels} from "$lib/stores/allModels";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {modelFns, modelOptions, propertyFns} from "@cozemble/model-api";
    import {createEventDispatcher, tick} from "svelte";
    import type {Writable} from "svelte/store";
    import type {DataRecordId} from "@cozemble/model-core";
    import {propertyDescriptors, propertyNameFns} from "@cozemble/model-core";
    import type {SlotBeingEdited} from "$lib/records/helpers";

    export let expandedRecordIds: Writable<DataRecordId[]>

    const modelControls = modelRecordsContextFns.getModelControls()
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const nestedModelBeingEdited = modelRecordsContextFns.getNestedModelBeingEdited()
    const records = modelRecordsContextFns.getRecords()
    const model = modelRecordsContextFns.getModel()

    const dispatch = createEventDispatcher()

    async function addInnerTable() {
        const nestedModelId = await modelControls.addNestedModel($eventSourcedModel, modelFns.newInstance('Inner table', modelOptions.withSlot(propertyFns.newInstance("Field 1"))), "many")
        await tick()
        expandLastRow(expandedRecordIds, $records)
        nestedModelBeingEdited.set(nestedModelId)
    }

    async function addInnerRecord() {
        const nestedModelId = await modelControls.addNestedModel($eventSourcedModel, modelFns.newInstance('Inner record', modelOptions.withSlot(propertyFns.newInstance("Field 1"))), "one")
        await tick()
        expandLastRow(expandedRecordIds, $records)
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
            const slotBeingEdited: SlotBeingEdited = {
                modelList: allEventSourcedModels,
                model: $eventSourcedModel,
                slot,
                anchorElement: element
            }
            dispatch('editSlot', {slotBeingEdited})
        }
    }

    function onClick(item: 'field' | 'subTable' | 'subRecord') {
        const elem = document.activeElement as HTMLElement;
        if (elem) {
            elem?.blur();
        }
        if (item === 'field') {
            addSlotToModel()
        } else if (item === 'subTable') {
            addInnerTable()
        } else if (item === 'subRecord') {
            addInnerRecord()
        }
    }
</script>

<div class="dropdown add-model-element">
    <label tabindex="0" class="label m-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
             stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
        </svg>
        <span class="ml-2">Add</span></label>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><a class="add-field" on:click={() => onClick('field')}>Field</a></li>
        <li><a class="add-sub-record" on:click={() => onClick('subRecord')}>Inner record</a></li>
        <li><a class="add-sub-table" on:click={() => onClick('subTable')}>Inner table</a></li>
    </ul>
</div>