<script lang="ts">
    import type {ModelEvent} from "@cozemble/model-core";
    import {
        type DataRecord, type Model, modelEventDescriptors, type
            ModelView, systemConfigurationFns
    } from "@cozemble/model-core";
    import {dataRecordFns, dataRecordValuePathFns, modelFns, modelOptions} from "@cozemble/model-api";
    import type {DataRecordEditorClient, UploadedAttachment} from "@cozemble/data-editor-sdk";
    import {dataRecordEditorHost, type DataRecordViewerClient, dataRecordViewerHost} from "@cozemble/data-editor-sdk";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import {type DecimalProperty, emptyProperty, registerDecimalProperty} from "@cozemble/model-decimal-core";
    import DecimalRepl from "./DecimalRepl.svelte";

    registerDecimalProperty()
    const systemConfiguration = systemConfigurationFns.empty()
    let model = modelFns.newInstance("Test model", modelOptions.withSlot(emptyProperty("Salary")))
    const record = dataRecordFns.random(systemConfiguration, [model], model)
    let showEditor = false
    $: property = model.slots[0] as DecimalProperty
    $: recordPath = dataRecordValuePathFns.newInstance(property)

    function onShowEditor() {
        showEditor = true
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchControlEvent(): void {
        },

        dispatchEditEvent(): void {
        },

        createNewRootRecord(): Promise<DataRecord | null> {
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

        saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
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

        searchRecords(): Promise<DataRecord[]> {
            throw new Error("Not implemented")
        },

        recordById(): Promise<DataRecord | null> {
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

    let modelEvents: ModelEvent[] = []

    function modelChanged(event: CustomEvent<ModelEvent>) {
        const modelEvent = event.detail as ModelEvent
        model = modelEventDescriptors.applyEvent(model, modelEvent)
        modelEvents = [...modelEvents, modelEvent]
    }

</script>

<DecimalRepl {model} {property} {recordPath} {modelEvents} on:modelChanged={modelChanged} {record}/>
