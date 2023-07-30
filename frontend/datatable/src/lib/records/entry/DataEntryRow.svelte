<script lang="ts">
    import type {Writable} from 'svelte/store'

    // Cozemble
    import type {Cardinality, DataRecord, DataRecordId, DataRecordPathParentElement, Model,} from '@cozemble/model-core'
    import {dataRecordIdFns} from '@cozemble/model-core'

    import type {DataRecordsTableOptions} from '../DataRecordsTableOptions'

    // common
    import {modelRecordsContextFns} from '../modelRecordsContextFns'
    // stores
    import {introductionsState} from '../../stores/introductions'
    import {contextHelper} from '../../stores/contextHelper'
    // components
    import WithSingleRecordContext from '../WithSingleRecordContext.svelte'
    import NestedDataRecordsInContext from '../NestedDataRecordsInContext.svelte'
    import AddSubItemDialogue from '../AddSubItemDialogue.svelte'
    import DataTd from '$lib/records/cells/DataTd.svelte'
    import DataEntryActions from "$lib/records/entry/DataEntryActions.svelte";

    export let parentPath: DataRecordPathParentElement[] = []
    export let options: DataRecordsTableOptions
    export let record: DataRecord
    export let rowIndex: number
    export let expandedRecordIds: Writable<DataRecordId[]>
    export let oneOnly: boolean
    export let extraClasses = ""
    let sequenceIdTooltip: HTMLDivElement

    // context
    const permitModelling = contextHelper.getPermitModelling()
    const modelControls = modelRecordsContextFns.getModelControls()
    const recordControls = modelRecordsContextFns.getRecordControls()
    const focusControls = modelRecordsContextFns.getFocusControls()
    const focus = modelRecordsContextFns.getFocus()
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const model = modelRecordsContextFns.getModel()

    let recordHavingSubItemAdded: string | null = null

    async function addNestedRecord(event: CustomEvent) {
        return addNestedModel(event.detail, 'one')
    }

    async function addNestedTable(event: CustomEvent) {
        return addNestedModel(event.detail, 'many')
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

    function recordSequenceTitle(seqId: number | undefined) {
        if (seqId) {
            return `Record sequential ID: ${seqId}`
        } else {
            return "Will be assigned a sequential ID when saved"
        }
    }

    function toggleRecordSequenceTooltip() {
        if (!sequenceIdTooltip) {
            return
        }
        if (sequenceIdTooltip.classList.contains('tooltip-open')) {
            sequenceIdTooltip.classList.remove('tooltip-open')
            return
        }
        sequenceIdTooltip.classList.toggle('tooltip-open')
        setTimeout(() => {
            sequenceIdTooltip.classList.remove('tooltip-open')
        }, 2000)
    }
</script>

<WithSingleRecordContext recordId={record.id} {rowIndex} let:rootRecordIndex>
    <tr data-row-index={rowIndex} class={extraClasses}>
        {#if parentPath.length === 0}
            <td class="border border-base-300" title={recordSequenceTitle(record.seqId)}
                on:click={toggleRecordSequenceTooltip}>
                <div class="tooltip z-50 tooltip-right" bind:this={sequenceIdTooltip} data-tip={recordSequenceTitle(record.seqId)}>
                    &nbsp;
                </div>
                {record.seqId ?? ""}
            </td>
        {/if}
        {#each $model.slots as slot, colIndex}
            {#if slot._type === 'property' || slot._type === 'model.reference'}
                <DataTd
                        {rowIndex}
                        {colIndex}
                        {record}
                        modelSlot={slot}
                        {parentPath}
                        {rootRecordIndex}
                        isFocused={$focus.isFocused(rootRecordIndex, parentPath, slot)}
                        isEditing={$focus.isEditing}
                        {focusControls}
                />
            {:else}
                <td>To do: {slot._type}</td>
            {/if}
        {/each}

        {#if options.permitModelEditing && $permitModelling}
            <td class="border border-base-300"/>
        {/if}

        {#if options.showActions}
            <td class="border border-base-300">
                <DataEntryActions {expandedRecordIds} model={$model} {record} {oneOnly} {parentPath}/>
            </td>
        {/if}
    </tr>

    {#if $expandedRecordIds.some((id) => id.value === record.id.value)}
        {#if $model.nestedModels.length > 0}
            <tr>
                <td class="border border-base-300" colspan={$model.slots.length + 2}>
                    <div class="nested-border p-3">
                        {#each $model.nestedModels as nestedModel}
                            <NestedDataRecordsInContext
                                    parentModelId={$model.id}
                                    {record}
                                    {nestedModel}
                                    {options}
                                    {parentPath}
                            />
                        {/each}
                    </div>
                </td>
            </tr>
        {/if}
    {/if}

    {#if recordHavingSubItemAdded === record.id.value}
        <tr>
            <td class="border border-base-300" colspan={$model.slots.length + 2}>
                <AddSubItemDialogue
                        showIntro={$introductionsState.subItemsIntroduction === null}
                        on:addNestedRecord={addNestedRecord}
                        on:close={() => (recordHavingSubItemAdded = null)}
                        on:addNestedTable={addNestedTable}
                />
            </td>
        </tr>
    {/if}
</WithSingleRecordContext>
