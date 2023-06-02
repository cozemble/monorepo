<script lang="ts">
    import type {DataRecord, DataRecordValuePath, ModelReference, SystemConfiguration} from "@cozemble/model-core";
    import {modelReferenceFns} from "@cozemble/model-core";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {afterUpdate} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {clickOutside} from "@cozemble/ui-atoms";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {
        dataRecordControlEvents,
        dataRecordEditEvents,
        eventSourcedRecordGraphFns
    } from "@cozemble/model-event-sourced";
    import ManyReferenceEditor from "$lib/records/modelReferences/ManyReferenceEditor.svelte";
    import SingleReferenceSelector from "$lib/records/modelReferences/SingleReferenceSelector.svelte";
    import type {DataRecordId} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration
    const model = modelRecordsContextFns.getModel()
    const recordGraph = modelRecordsContextFns.getEventSourcedRecordGraph()
    const modelReference = recordPath.lastElement as ModelReference
    const cardinality = modelReferenceFns.getCardinality(modelReference)

    $: selectedRecordIds = eventSourcedRecordGraphFns.referencedRecordIds($recordGraph, record.id, modelReference)

    const dataRecordEditorClient = dataRecordEditor.getClient()

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
                selectedRecordIds,
                selectedRecord ? [selectedRecord.id] : [],
                'Tab',
            ),
        )
    }


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

    function singleReferenceSelected(event: CustomEvent<{ record: DataRecord | null }>) {
        const selectedRecord = event.detail.record
        setSelectedRecord(selectedRecord)
    }

    function saveMany(event: CustomEvent<{ selectedRecordIds: DataRecordId[] }>) {
        const newSelection = event.detail.selectedRecordIds
        console.log({newSelection})
        dataRecordEditorClient.dispatchEditEvent(
            dataRecordEditEvents.valueChanged(
                record,
                recordPath,
                selectedRecordIds,
                newSelection,
                'Tab',
            ),
        )
        console.log('dispatched edit event')
    }

    afterUpdate(() => console.log({recordGraph: $recordGraph, selectedRecordIds, record, modelReference}))
</script>

<svelte:window on:keydown={handleKeydown}/>
<div use:clickOutside
     on:click_outside={close}>
    <div class="editor border border-base-300 rounded">
        {#if cardinality === 'many'}
            <ManyReferenceEditor {selectedRecordIds} {editorParams} {modelReference} {record} on:cancel={close}
                                 on:save={saveMany}/>
        {:else}
            <SingleReferenceSelector {selectedRecordIds} {editorParams} {modelReference} {record}
                                     on:selected={singleReferenceSelected}/>
        {/if}
    </div>
</div>

<style>
    .editor {
        position: absolute;
        border-width: 2px;
        z-index: 100;
    }
</style>