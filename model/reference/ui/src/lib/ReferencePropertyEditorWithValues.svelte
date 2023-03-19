<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordControlEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {makeSummaryView} from "./editorHelper";
    import {dataRecordPathFns} from "@cozemble/model-api";
    import type {ReferencedRecords} from "@cozemble/model-reference-core";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk/dist/esm";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    export let editorParams: EditorParams

    let initialValue: ReferencedRecords | null = dataRecordPathFns.getValue(recordPath, record) ?? null

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

    function optionChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const selectedRecordId = target.value
        const selectedRecord = options.find(option => option.id.value === selectedRecordId)
        if (selectedRecord) {
            const newValue: ReferencedRecords = {
                _type: "referenced.records",
                recordIds: [{_type: "data.record.id", value: selectedRecordId}]
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

</script>

<select class="input input-bordered" on:change={optionChanged}>
    <option selected={initialValue === null}>----</option>
    {#each options as option}
        {@const view = makeSummaryView(option, editorParams)}
        <option value={option.id.value}>{view}</option>
    {/each}
</select>