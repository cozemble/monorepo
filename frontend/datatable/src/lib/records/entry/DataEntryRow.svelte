<script lang="ts">
    import type {Cardinality, DataRecord, DataRecordId, DataRecordPathParentElement, Model} from "@cozemble/model-core";
    import {dataRecordIdFns} from "@cozemble/model-core";
    import type {DataRecordsTableOptions} from "../DataRecordsTableOptions";
    import {introductionsState} from "../../stores/introductions";
    import WithSingleRecordContext from "../WithSingleRecordContext.svelte";
    import DataTd from "../DataTd.svelte";
    import {modelRecordsContextFns} from "../modelRecordsContextFns";
    import type {Writable} from "svelte/store";
    import {contextHelper} from "../../stores/contextHelper";
    import ExpandCollapseButton from "../ExpandCollapseButton.svelte";
    import NestedDataRecordsInContext from "../NestedDataRecordsInContext.svelte";
    import AddSubItemDialogue from "../AddSubItemDialogue.svelte";

    export let parentPath: DataRecordPathParentElement[] = []
    export let options: DataRecordsTableOptions
    export let record: DataRecord
    export let rowIndex: number
    export let expandedRecordIds: Writable<DataRecordId[]>
    export let oneOnly: boolean

    const permitModelling = contextHelper.getPermitModelling()
    const modelControls = modelRecordsContextFns.getModelControls()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const focusControls = modelRecordsContextFns.getFocusControls()
    const focus = modelRecordsContextFns.getFocus()
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()

    let recordHavingSubItemAdded: string | null = null

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

    async function save(record: DataRecord, rootRecordIndex: number) {
        const outcome = await recordControls.saveRecord(record.id)
        if (outcome) {
            expandRecord(record.id)
        } else {
            focusControls.ensureNotFocusedOnRow(rootRecordIndex)
        }
    }


</script>
<WithSingleRecordContext recordId={record.id} {rowIndex} let:rootRecordIndex={rootRecordIndex}>
    <tr data-row-index={rowIndex}>
        {#each $model.slots as slot, colIndex}
            {#if slot._type === 'property' || slot._type === 'model.reference'}
                <DataTd {rowIndex} {colIndex} {record} modelSlot={slot}
                        {parentPath} {rootRecordIndex}
                        isFocused={$focus.isFocused(rootRecordIndex, parentPath, slot)}
                        isEditing={$focus.isEditing} {focusControls}/>
            {:else}
                <td>To do: {slot._type}</td>
            {/if}
        {/each}
        {#if options.permitModelEditing && $permitModelling}
            <td class="border border-base-300"></td>
        {/if}
        {#if options.showActions}
            <td class="border border-base-300">
                <div class="flex items-center">
                    <ExpandCollapseButton {expandedRecordIds} model={$model} {record}/>
                    {#if !oneOnly}
                        <button class="btn btn-ghost btn-active btn-sm  mr-2"
                                on:click={() => alert("to do")}>
                            Delete
                        </button>
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
                            <NestedDataRecordsInContext parentModelId={$model.id} {record} {nestedModel} {options} {parentPath}/>
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


