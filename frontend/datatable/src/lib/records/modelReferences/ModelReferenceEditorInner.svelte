<script lang="ts">
    import type {
        DataRecord,
        DataRecordId,
        DataRecordValuePath,
        ModelReference,
        SystemConfiguration
    } from "@cozemble/model-core";
    import {dataRecordControlEvents, dataRecordEditEvents, dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {afterUpdate, onMount} from "svelte";
    import {type EditorParams, makeSummaryView} from "./editorHelper";
    import {clickOutside} from "@cozemble/ui-atoms";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {eventSourcedRecordGraphFns} from "@cozemble/model-event-sourced";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration
    const model = modelRecordsContextFns.getModel()
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()
    const modelReference = recordPath.lastElement as ModelReference

    $: selectedRecordIds = eventSourcedRecordGraphFns.referencedRecordIds($recordGraph, record.id, modelReference)


    // let initialValue: ReferencedRecords | null = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null
    //
    // $:selectedRecordId = initialValue?.referencedRecords[0]?.referencedRecordId.value ?? null;

    const dataRecordEditorClient = dataRecordEditor.getClient()
    let options: DataRecord[] = []
    let searchTerm = ""

    let htmlRender: string | null = null
    // let referencedRecord: DataRecord | null = null
    //
    // $: referencedRecords = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) as ReferencedRecords ?? null
    // $: dereference(dataRecordEditorClient, editorParams.referencedModelId, referencedRecords, (record) => referencedRecord = record)
    // $: htmlRender = renderReference(referencedRecord, editorParams)

    function cancel(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        close()
    }

    function close() {
        dataRecordEditorClient.dispatchControlEvent(
            dataRecordControlEvents.editAborted(record, recordPath),
        )
    }

    function setSelectedRecord(selectedRecord: DataRecord | null) {
        dataRecordEditorClient.dispatchEditEvent(
            dataRecordEditEvents.valueChanged(
                record,
                recordPath,
                null,
                selectedRecord,
                'Tab',
            ),
        )
    }


    async function createNewRecord() {
        const createdRecord = await dataRecordEditorClient.createNewRootRecord(editorParams.referencedModelId)
        if (createdRecord) {
            options.push(createdRecord)
        }
        setSelectedRecord(createdRecord)
    }


    function optionChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const selectedValue = target.value
        if (selectedValue === "create.new.record") {
            setTimeout(() => createNewRecord(), 0)
        } else {
            setSelectedRecord(options.find(option => option.id.value === selectedValue) ?? null)
        }
    }


    onMount(async () => {
        options = await dataRecordEditorClient.searchRecords(editorParams.referencedModelId, searchTerm)
    })

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.editAborted(record, recordPath),
            )
        }
        if (event.key === "Tab") {
            dataRecordEditorClient.dispatchControlEvent(
                dataRecordControlEvents.moveFocus(record, recordPath, "right"),
            )
        }
    }

    function isSelected(selectedRecordIds: DataRecordId[], recordId: DataRecordId | null): boolean {
        // return false
        return recordId !== null && selectedRecordIds.some(id => id.value === recordId.value)
    }

    afterUpdate(() => console.log({recordGraph: $recordGraph, selectedRecordIds}))
</script>

<svelte:window on:keydown={handleKeydown}/>
<div use:clickOutside
     on:click_outside={close}>
    {#if htmlRender}
        {@html htmlRender}
    {:else}
        ----
    {/if}
    <div class="editor">
        <select class="input input-bordered reference-selector" on:change={optionChanged}>
            <option selected={selectedRecordIds.length === 0}>----</option>
            <option value="create.new.record">Create a new {editorParams.referencedModel.name.value}</option>
            {#each options as option}
                {@const view = makeSummaryView(option, editorParams)}
                <option value={option.id.value} selected={isSelected(selectedRecordIds,option.id)}>{view}</option>
            {/each}
        </select>
    </div>
</div>

<style>
    .editor {
        position: absolute;
    }
</style>