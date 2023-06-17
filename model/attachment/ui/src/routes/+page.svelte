<script lang="ts">
    import {type AttachmentProperty, emptyProperty, registerAttachmentProperty} from "@cozemble/model-attachment-core";
    import {
        type Model, type
            ModelView, systemConfigurationFns
    } from "@cozemble/model-core";
    import {dataRecordFns, dataRecordValuePathFns, modelFns, modelOptions} from "@cozemble/model-api";
    import type {DataRecordEditorClient, UploadedAttachment} from "@cozemble/data-editor-sdk";
    import {dataRecordEditorHost, type DataRecordViewerClient, dataRecordViewerHost} from "@cozemble/data-editor-sdk";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import {AttachmentPropertyEditor} from "$lib";
    import AttachmentPropertyViewer from "$lib/AttachmentPropertyViewerWrapper.svelte";
    import {propertyDescriptors} from "@cozemble/model-core";
    import {dataRecordEditEvents} from "@cozemble/model-event-sourced";

    registerAttachmentProperty()
    const property: AttachmentProperty = emptyProperty("Pictures")
    const systemConfiguration = systemConfigurationFns.empty()
    const recordPath = dataRecordValuePathFns.newInstance(property)
    const model = modelFns.newInstance("Test model", modelOptions.withSlot(property))
    const record = dataRecordFns.random(systemConfiguration, [model], model)
    const propertyDescriptor = propertyDescriptors.mandatory(property)

    let showEditor = false

    function onShowEditor() {
        showEditor = true
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        recordById() {
            throw new Error("Not implemented")
        },

        dispatchControlEvent(): void {
        },

        dispatchEditEvent(): void {
        },

        createNewRootRecord() {
            throw new Error("Not implemented")
        },

        searchRecords() {
            throw new Error("Not implemented")
        },

        getModels() {
            throw new Error("Not implemented")
        },

        getModelViews() {
            throw new Error("Not implemented")
        },

        saveModelView() {
            throw new Error("Not implemented")
        },

        async uploadAttachments(files: File[],
                                progressUpdater: (percent: number) => void): Promise<UploadedAttachment[]> {
            progressUpdater(100)
            return files.map(f => ({
                _type: 'uploaded.attachment',
                attachmentId: f.name,
                file: f,
                size: null,
                thumbnailUrl: 'https://freesvg.org/img/ftthumbnail.png',
            }))
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

    const viewer: DataRecordViewerClient = {
        getModels(): Model[] {
            throw new Error("Not implemented")
        },

        searchRecords() {
            throw new Error("Not implemented")
        },

        recordById() {
            throw new Error("Not implemented")
        },

        getAttachmentViewUrls(): Promise<string[]> {
            throw new Error("Not implemented")
        },

        dispatchEditEvent(): void {
        },

        instructUser(): void {
        },

        getModelViews(): ModelView[] {
            throw new Error("Not implemented")
        },
        saveModelView(): Promise<JustErrorMessage | null> {
            throw new Error("Not implemented")
        },

    }

    dataRecordViewerHost.setClient(viewer)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null

    function changeHandler(newValue: any | null, submitEvent: KeyboardEvent | null) {
        if (newValue !== value) {
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    value,
                    newValue,
                    null,
                ),
            )
        }
    }


</script>

<div class="m-4">
    <table class="table">
        <tr>
            <td class="border">Left</td>
            <td class="border">
                <div class="m-4 flex" on:click={onShowEditor}>
                    <div>
                        {#if showEditor}
                            <div>
                                <AttachmentPropertyEditor {value} {changeHandler}/>
                            </div>
                        {:else}
                            <div class="w-full h-full">
                                <AttachmentPropertyViewer {record} {recordPath} {systemConfiguration}/>
                            </div>
                        {/if}
                    </div>
                </div>
            </td>
            <td class="border">Right</td>
        </tr>
    </table>
</div>