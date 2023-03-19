<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordControlEvents, dataRecordEditEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {makeSummaryView} from "./editorHelper";
    import {dataRecordPathFns} from "@cozemble/model-api";
    import type {ReferencedRecords} from "@cozemble/model-reference-core";
    import {afterUpdate} from "svelte";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    export let editorParams: EditorParams

    let initialValue: ReferencedRecords | null = dataRecordPathFns.getValue(recordPath, record) ?? null

    $:selectedRecordId = initialValue?.referencedRecordIds[0]?.value ?? null;

    afterUpdate(() => console.log("afterUpdate", {initialValue, selectedRecordId}))

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

    onMount(async () => {
        options = await dataRecordEditorClient.searchRecords(editorParams.referencedModelId, searchTerm)
    })

    function setSelectedRecord(selectedRecord: DataRecord | null) {
        if (selectedRecord) {
            const newValue: ReferencedRecords = {
                _type: "referenced.records",
                referencedRecordIds: [selectedRecord.id]
            }
            console.log({initialValue, newValue})
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
        console.log("selectedValue", selectedValue)
        if (selectedValue === "create.new.record") {
            setTimeout(() => createNewRecord(), 0)
        } else {
            setSelectedRecord(options.find(option => option.id.value === selectedValue) ?? null)
        }
    }

</script>

<select class="input input-bordered" on:change={optionChanged}>
    <option selected={initialValue === null}>----</option>
    <option value="create.new.record">Create a new {editorParams.referencedModel.name.value}</option>
    {#each options as option}
        {@const view = makeSummaryView(option, editorParams)}
        <option value={option.id.value} selected={selectedRecordId === option.id.value}>{view}</option>
    {/each}
</select>