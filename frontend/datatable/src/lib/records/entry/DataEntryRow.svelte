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

    const dirtyRecords = modelRecordsContextFns.getDirtyRecords()
    const permitModelling = contextHelper.getPermitModelling()
    const modelControls = modelRecordsContextFns.getModelControls()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const focusControls = modelRecordsContextFns.getFocusControls()
    const focus = modelRecordsContextFns.getFocus()
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()

    let recordHavingSubItemAdded: string | null = null

    function beginSubItem(record: DataRecord) {
        recordHavingSubItemAdded = record.id.value
    }

    function isDirtyRecord(dirtyRecordIds: DataRecordId[], record: DataRecord) {
        return dirtyRecordIds.some(dirtyRecordId => dirtyRecordId.value === record.id.value)
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

    async function save(record: DataRecord, rootRecordIndex: number) {
        const outcome = await recordControls.saveRecord(record.id)
        if (outcome) {
            expandRecord(record.id)
        } else {
            focusControls.ensureNotFocusedOnRow(rootRecordIndex)
        }
    }


</script>
<WithSingleRecordContext {record} {rowIndex} let:rootRecordIndex={rootRecordIndex}>
    <tr data-row-index={rowIndex}>
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
            <td class="border border-base-300"></td>
        {/if}
        {#if options.showActions}
            <td class="border border-base-300">
                <div class="flex items-center">
                    {#if isDirtyRecord($dirtyRecords, record)}
                        <button class="btn btn-primary btn-sm mr-2 save-record"
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
                        <!--{#if options.permitSubItemAddition && $permitModelling}-->
                        <!--    <button class="btn btn-ghost btn-active btn-sm mr-2 add-sub-section"-->
                        <!--            on:click={() => beginSubItem(record)}>-->
                        <!--        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"-->
                        <!--             stroke-width="1.5"-->
                        <!--             stroke="currentColor" class="w-6 h-6">-->
                        <!--            <path stroke-linecap="round" stroke-linejoin="round"-->
                        <!--                  d="M12 4.5v15m7.5-7.5h-15"/>-->
                        <!--        </svg>-->
                        <!--        Add sub-section-->
                        <!--    </button>-->
                        <!--{/if}-->
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


