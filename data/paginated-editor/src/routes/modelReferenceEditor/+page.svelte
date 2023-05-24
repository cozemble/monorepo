<script lang="ts">

    import type {DataRecordEditorClient, UploadedAttachment} from "@cozemble/data-editor-sdk";
    import {dataRecordEditorHost} from "@cozemble/data-editor-sdk";
    import type {Model, ModelView, RecordAndEdges} from "@cozemble/model-core";
    import {
        type ModelReference,
        modelReferenceFns,
        modelViewFns,
        recordsAndEdges,
        summaryViewFns,
        systemConfigurationFns
    } from "@cozemble/model-core";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import ModelReferenceEditor from "$lib/modelReferences/ModelReferenceEditor.svelte";
    import {
        dataRecordFns,
        dataRecordValuePathFns,
        modelFns,
        modelIdFns,
        modelOptions,
        propertyFns,
        propertyOptions
    } from "@cozemble/model-api";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced";

    const systemConfiguration = systemConfigurationFns.empty()
    const invoiceModelId = modelIdFns.newInstance("invoices")
    const customerModel = modelFns.newInstance("Customers", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    const invoiceModel = modelFns.newInstance("Invoices", modelOptions.withId(invoiceModelId), modelOptions.withSlot(modelReferenceFns.newInstance(invoiceModelId, [customerModel.id], "Customer")))
    const models = [customerModel, invoiceModel]
    const invoiceRecord1 = dataRecordFns.newInstance(invoiceModel, "test")
    const referenceSlot = invoiceModel.slots[0] as ModelReference
    const path = dataRecordValuePathFns.newInstance(referenceSlot)
    const modelView = modelViewFns.newInstance("Summary View", customerModel.id, summaryViewFns.empty())

    const dataRecordEditorClient: DataRecordEditorClient = {
        async recordById(): Promise<RecordAndEdges | null> {
            return null
        },

        createNewRootRecord(): Promise<EventSourcedRecordGraph | null> {
            throw new Error("Not implemented")
        },

        dispatchEditEvent(): void {
            throw new Error("Not implemented")
        },
        dispatchControlEvent(): void {
            throw new Error("Not implemented")
        },
        async searchRecords() {
            return recordsAndEdges([], [])
        },
        getModelViews(): ModelView[] {
            return [modelView]
        },
        saveModelView(): Promise<JustErrorMessage | null> {
            throw new Error("Not implemented")
        },
        getModels(): Model[] {
            return models
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
            throw new Error("Not implemented")
        },
    }

    dataRecordEditorHost.setClient(dataRecordEditorClient)


</script>

<ModelReferenceEditor {systemConfiguration} record={invoiceRecord1} recordPath={path}/>