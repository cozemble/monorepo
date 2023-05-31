<script lang="ts">
    import type {DataRecord, DataRecordValuePath, ReferencedRecords, SystemConfiguration} from "@cozemble/model-core";
    import type {RecordAndEdges} from "@cozemble/model-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import {type EditorParams, makeSummaryView} from "./editorHelper";
    import {dereference} from "$lib/modelReferences/dereference";
    import {renderReference} from "$lib/modelReferences/renderReference";
    import {clickOutside} from "@cozemble/ui-atoms";
    import {dataRecordControlEvents, dataRecordEditEvents} from "@cozemble/model-event-sourced";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration

    let initialValue: ReferencedRecords | null = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null

    $:referencedRecordId = initialValue?.referencedRecords[0]?.referencedRecordId.value ?? null;

    const dataRecordEditorClient = dataRecordEditor.getClient()
    let options: DataRecord[] = []
    let searchTerm = ""

    let referencedRecord: RecordAndEdges | null = null

    $: referencedRecords = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) as ReferencedRecords ?? null
    $: dereference(dataRecordEditorClient, editorParams.referencedModelId, referencedRecords, (record) => referencedRecord = record)
    $: htmlRender = renderReference(referencedRecord, editorParams)

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
        if (selectedRecord) {
            const newValue: ReferencedRecords = {
                _type: "referenced.records",
                referencedRecords: [{
                    _type: "referenced.record",
                    referencedRecordId: selectedRecord.id,
                    referencedModelId: selectedRecord.modelId
                }]
            }
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    initialValue,
                    newValue,
                    'Tab',
                ),
            )
            initialValue = newValue
        } else {
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    initialValue,
                    null,
                    'Tab',
                ),
            )
            initialValue = null
        }
    }


    async function createNewRecord() {
        const createdGraph = await dataRecordEditorClient.createNewRootRecord(editorParams.referencedModelId)
        if (!createdGraph) {
            return
        }
        const createdRecord = createdGraph.records[0] ?? null
        if (createdRecord) {
            options.push(createdRecord.record)
        }
        setSelectedRecord(createdRecord.record)
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
        const found = await dataRecordEditorClient.searchRecords(editorParams.referencedModelId, searchTerm)
        options = found.records
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
            <option selected={initialValue === null}>----</option>
            <option value="create.new.record">Create a new {editorParams.referencedModel.name.value}</option>
            {#each options as option}
                {@const view = makeSummaryView(option, editorParams)}
                <option value={option.id.value} selected={referencedRecordId === option.id.value}>{view}</option>
            {/each}
        </select>
    </div>
</div>

<style>
    .editor {
        position: absolute;
    }
</style>