<script lang="ts">

    import ModelReferenceViewer from "../../lib/modelReferences/ModelReferenceViewer.svelte";
    import type {DataRecord, DataRecordId, ModelId, ModelReference, ModelView} from "@cozemble/model-core";
    import {modelReferenceFns, recordsAndEdges, systemConfigurationFns} from "@cozemble/model-core";
    import {makeDataRecordViewer} from "../../lib/makeDataRecordViewer";
    import {
        type AttachmentIdAndFileName,
        dataRecordViewerHost,
        type UploadedAttachment
    } from "@cozemble/data-editor-sdk";
    import type {PaginatedEditorHost, RecordDeleteOutcome, RecordSaveOutcome} from "../../lib";
    import {
        dataRecordFns,
        dataRecordValuePathFns,
        modelFns,
        modelIdFns,
        modelOptions,
        propertyFns,
        propertyOptions
    } from "@cozemble/model-api";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import type {EventSourcedDataRecord} from "@cozemble/model-event-sourced";

    const systemConfiguration = systemConfigurationFns.empty()
    const customerModel = modelFns.newInstance("Customers", modelOptions.withProperties(propertyFns.newInstance("First name", propertyOptions.required), propertyFns.newInstance("Last name")))
    const invoiceModelId = modelIdFns.newInstance("invoices")

    const invoiceModel = modelFns.newInstance("Invoices", modelOptions.withId(invoiceModelId), modelOptions.withSlot(modelReferenceFns.newInstance(invoiceModelId, [customerModel.id], "Customer")))
    const models = [customerModel, invoiceModel]
    const invoiceRecord1 = dataRecordFns.newInstance(invoiceModel, "test")
    const referenceSlot = invoiceModel.slots[0] as ModelReference
    const path = dataRecordValuePathFns.newInstance(referenceSlot)


    const modelViews: ModelView[] = []

    async function recordEdited(
        editedRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
        throw new Error("Not implemented")
    }

    function onError(error: Error) {
        throw new Error("Not implemented")
    }

    const noOpEditorHost: PaginatedEditorHost = {

        viewRecord(record: DataRecord, viewNow: boolean): void {
            console.log('View record', record, viewNow)
        },
        async recordEdited(
            editedRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            throw new Error("Not implemented")
        },

        async saveNewRecord(
            newRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            throw new Error("Not implemented")
        },

        async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
            throw new Error("Not implemented")
        },
        async searchRecords(
            _modelId: ModelId,
            _search: string,
        ) {
            return recordsAndEdges([], [])
        },
        async recordById(_modelId: ModelId, _recordId: DataRecordId) {
            return null
        },
        async uploadAttachments(
            _files: File[],
            _progressUpdater: (percent: number) => void,
        ): Promise<UploadedAttachment[]> {
            return [] as UploadedAttachment[]
        },
        async deleteAttachments(_attachmentIds: string[]): Promise<void> {
            throw new Error('Not implemented')
        },

        async getAttachmentViewUrls(_attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
            throw new Error('Not implemented')
        },
        instructUser() {
            throw new Error('Not implemented')
        },
        getModelViews(modelId: ModelId): ModelView[] {
            throw new Error('Not implemented')
        },
        saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
            throw new Error('Not implemented')
        }

    }


    dataRecordViewerHost.setClient(makeDataRecordViewer(systemConfiguration, models, modelViews, noOpEditorHost, recordEdited, onError))

</script>
<ModelReferenceViewer {systemConfiguration} record={invoiceRecord1} recordPath={path}/>