<script lang="ts">
    import type {DataRecord, DataRecordValuePath, ReferencedRecords} from "@cozemble/model-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import {dataRecordControlEvents, dataRecordEditEvents, dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import {type EditorParams, makeSummaryView} from "./editorHelper";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams

    let initialValue: ReferencedRecords | null = dataRecordValuePathFns.getValue(recordPath, record) ?? null

    $:selectedRecordId = initialValue?.referencedRecords[0]?.referencedRecordId.value ?? null;

    const dataRecordEditorClient = dataRecordEditor.getClient()
    let options: DataRecord[] = []
    let searchTerm = ""

    function cancel(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

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
                    null,
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
                    null,
                ),
            )
            initialValue = null
        }
    }


    async function createNewRecord() {
        const createdRecord = await dataRecordEditorClient.createNewRecord(editorParams.referencedModelId)
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
</script>

<select class="input input-bordered" on:change={optionChanged}>
    <option selected={initialValue === null}>----</option>
    <option value="create.new.record">Create a new {editorParams.referencedModel.name.value}</option>
    {#each options as option}
        {@const view = makeSummaryView(option, editorParams)}
        <option value={option.id.value} selected={selectedRecordId === option.id.value}>{view}</option>
    {/each}
</select>