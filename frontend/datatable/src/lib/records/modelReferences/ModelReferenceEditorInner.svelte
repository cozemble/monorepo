<script lang="ts">
    import type {
        DataRecord,
        DataRecordId,
        DataRecordValuePath,
        ModelReference,
        SystemConfiguration
    } from "@cozemble/model-core";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {afterUpdate, onMount} from "svelte";
    import {type EditorParams, getCreatedRecord, makeSummaryView} from "./editorHelper";
    import {clickOutside} from "@cozemble/ui-atoms";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {
        dataRecordControlEvents,
        dataRecordEditEvents,
        eventSourcedRecordGraphFns
    } from "@cozemble/model-event-sourced";
    import {inverseReferenceSetter} from "$lib/records/modelReferences/editorHelper";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration
    const model = modelRecordsContextFns.getModel()
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()
    const modelReference = recordPath.lastElement as ModelReference

    $: selectedRecordIds = eventSourcedRecordGraphFns.referencedRecordIds($recordGraph, record.id, modelReference)

    const dataRecordEditorClient = dataRecordEditor.getClient()
    let options: DataRecord[] = []
    let searchTerm = ""

    let htmlRender: string | null = null

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
        const createdGraph = await dataRecordEditorClient.createNewRootRecord(editorParams.referencedModelId, inverseReferenceSetter(editorParams.referencedModelId, modelReference.id, record))
        if (createdGraph === null) {
            return
        }
        const createdRecord = getCreatedRecord(createdGraph, editorParams.referencedModelId)
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
        return recordId !== null && selectedRecordIds.some(id => id.value === recordId.value)
    }

    afterUpdate(() => console.log({recordGraph: $recordGraph, selectedRecordIds, record, modelReference}))
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