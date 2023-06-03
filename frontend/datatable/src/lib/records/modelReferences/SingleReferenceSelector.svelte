<script lang="ts">

    import {
        type EditorParams,
        getCreatedRecord,
        inverseReferenceSetter,
        makeSummaryView
    } from "$lib/records/modelReferences/editorHelper";
    import {subGraphCollectorsByRecordIdFns} from "$lib/records/RecordControls";
    import type {DataRecord, DataRecordId} from "@cozemble/model-core";
    import {tinyValueFns} from "@cozemble/model-core";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {singleRecordEditContext} from "$lib/records/contextHelper";
    import {eventSourcedRecordGraphFns} from "@cozemble/model-event-sourced";
    import {createEventDispatcher, onMount} from "svelte";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import type {ModelReference} from "@cozemble/model-core";

    export let editorParams: EditorParams
    export let selectedRecordIds: DataRecordId[] = []
    export let record: DataRecord
    export let modelReference: ModelReference
    export let showSelected = true

    const subGraphCollectors = modelRecordsContextFns.getSubGraphCollectorsByRecordId()
    const rootRecordId = singleRecordEditContext.getRootRecordId()
    const dataRecordEditorClient = dataRecordEditor.getClient()
    const dispatch = createEventDispatcher()

    let options: DataRecord[] = []
    let searchTerm = ""

    async function createNewRecord() {
        const edgeId = tinyValueFns.id()
        const createdGraph = await dataRecordEditorClient.createNewRootRecord(editorParams.referencedModelId, inverseReferenceSetter(edgeId, editorParams.referencedModelId, modelReference.id, record))
        if (createdGraph === null) {
            return
        }
        subGraphCollectorsByRecordIdFns.addCreated(subGraphCollectors, rootRecordId, eventSourcedRecordGraphFns.removeEdge(createdGraph, edgeId))
        const createdRecord = getCreatedRecord(createdGraph, editorParams.referencedModelId)
        if (createdRecord) {
            options.push(createdRecord)
        }
        dispatch('selected', {record: createdRecord})
    }

    function optionChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const selectedValue = target.value
        if (selectedValue === "create.new.record") {
            setTimeout(() => createNewRecord(), 0)
            target.value = "0"
        } else {
            dispatch('selected', {record: options.find(option => option.id.value === selectedValue) ?? null})
        }
    }

    function isSelected(selectedRecordIds: DataRecordId[], recordId: DataRecordId | null): boolean {
        return showSelected && (recordId !== null && selectedRecordIds.some(id => id.value === recordId.value))
    }

    onMount(async () => {
        const found = await dataRecordEditorClient.searchRecords(editorParams.referencedModelId, searchTerm)
        options = found.records
    })
</script>

<select class="input input-bordered reference-selector" on:change={optionChanged}>
    <option value="0" selected={selectedRecordIds.length === 0}>----</option>
    <option value="create.new.record">Create a new {editorParams.referencedModel.name.value}</option>
    {#each options as option}
        {@const view = makeSummaryView(option, editorParams)}
        <option value={option.id.value} selected={isSelected(selectedRecordIds,option.id)}>{view}</option>
    {/each}
</select>
