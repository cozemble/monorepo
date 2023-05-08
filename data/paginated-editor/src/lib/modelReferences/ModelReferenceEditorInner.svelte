<script lang="ts">
    import type {DataRecord, DataRecordValuePath, ReferencedRecords, SystemConfiguration} from "@cozemble/model-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import {dataRecordControlEvents, dataRecordEditEvents, dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import {type EditorParams, makeSummaryView} from "./editorHelper";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let editorParams: EditorParams
    export let systemConfiguration: SystemConfiguration


    let initialValue: ReferencedRecords | null = dataRecordValuePathFns.getValue(systemConfiguration, recordPath, record) ?? null

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
        console.log({createdRecord})
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
</script>

<svelte:window on:keydown={handleKeydown}/>
<select class="input input-bordered reference-selector" on:change={optionChanged}>
    <option selected={initialValue === null}>----</option>
    <option value="create.new.record">Create a new {editorParams.referencedModel.name.value}</option>
    {#each options as option}
        {@const view = makeSummaryView(option, editorParams)}
        <option value={option.id.value} selected={selectedRecordId === option.id.value}>{view}</option>
    {/each}
</select>