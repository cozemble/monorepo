<script lang="ts">
    import type {DateProperty} from "@cozemble/model-date-core";
    import {emptyProperty, registerDateProperty} from "@cozemble/model-date-core";
    import type {DataRecord, Model, ModelView} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {dataRecordFns, dataRecordValuePathFns, modelFns, modelOptions} from "@cozemble/model-api";
    import DatePropertyViewer from "../lib/DatePropertyViewer.svelte";
    import DatePropertyEditor from "../lib/DatePropertyEditor.svelte";
    import {
        type DataRecordEditorClient,
        dataRecordEditorHost,
        type UploadedAttachment
    } from "@cozemble/data-editor-sdk";
    import type {JustErrorMessage} from "@cozemble/lang-util";

    registerDateProperty()
    const dateProperty: DateProperty = emptyProperty("Date of birth")
    const systemConfiguration = systemConfigurationFns.empty()
    const recordPath = dataRecordValuePathFns.newInstance(dateProperty)
    const model = modelFns.newInstance("Test model", modelOptions.withSlot(dateProperty))
    const record = dataRecordFns.random(systemConfiguration, [model], model)
    let showEditor = false

    function onShowEditor() {
        showEditor = true
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchControlEvent(): void {
        },

        dispatchEditEvent(): void {
        },

        createNewRecord(): Promise<DataRecord | null> {
            throw new Error("Not implemented")
        },

        searchRecords(): Promise<DataRecord[]> {
            throw new Error("Not implemented")
        },

        getModels(): Model[] {
            throw new Error("Not implemented")
        },

        getModelViews(): ModelView[] {
            throw new Error("Not implemented")
        },

        saveModelView(): Promise<JustErrorMessage | null> {
            throw new Error("Not implemented")
        },

        uploadAttachments(): Promise<UploadedAttachment[]> {
            throw new Error("Not implemented")
        },

        deleteAttachments(): Promise<void> {
            throw new Error("Not implemented")
        },

        getAttachmentViewUrls(): Promise<string[]> {
            throw new Error("Not implemented")
        },

        instructUser(): void {
        },
    }

    dataRecordEditorHost.setClient(dataRecordEditorClient)

</script>

<div class="m-4 flex">
    <div class="border p-2">
        {#if showEditor}
            <div>
                <DatePropertyEditor {record} {recordPath} {systemConfiguration}/>
            </div>
        {:else}
            <div on:click={onShowEditor}>
                <DatePropertyViewer {record} {recordPath} {systemConfiguration}/>
            </div>
        {/if}
    </div>
</div>