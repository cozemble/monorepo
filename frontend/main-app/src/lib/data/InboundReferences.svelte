<script lang="ts">
    import type {DataRecord, Model, ModelId, ModelPath, ModelPathElement} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import {onMount} from "svelte";
    import {makeOnNewRecord, referencingRecordsHelper} from "./referencingRecordsHelper";
    import ErrorMessage from "../util/ErrorMessage.svelte";
    import {getSystemConfiguration, modelViews, tenantEntities} from "../models/tenantEntityStore";
    import {PaginatedEditor} from "@cozemble/data-paginated-editor";
    import {type Writable, writable} from "svelte/store";
    import {makePaginatedEditorHost} from "./paginatedEditorHost";
    import type {EventSourcedDataRecordOption} from "@cozemble/data-editor-sdk";

    export let tenantId: string
    export let models: Model[]
    export let referencingModelId: ModelId //the Booking model id for example
    export let record: DataRecord //the Customer model for example
    const referencingModel = modelFns.findById(models, referencingModelId) // the Booking model for example
    const targetModel = modelFns.findById(models, record.modelId) // the Customer model for example
    let referencingRecords: Writable<DataRecord[]> = writable([]) // the bookings for the customer
    let pathsReferencingTargetModel: ModelPath<ModelPathElement>[] = []
    let onNewRecordAssignReference: EventSourcedDataRecordOption = (record) => record
    let error: string | null = null

    onMount(async () => {
        try {
            pathsReferencingTargetModel = modelFns.allPathsReferencingModel(models, referencingModel, record.modelId)
            if (pathsReferencingTargetModel.length !== 1) {
                error = `Expected exactly one path referencing model ${targetModel.name.value} from model ${referencingModel.name.value}, found ${pathsReferencingTargetModel.length}`
                return
            }
            onNewRecordAssignReference = makeOnNewRecord(getSystemConfiguration($tenantEntities),pathsReferencingTargetModel, record)
            const loaded = await referencingRecordsHelper(tenantId, record.id, referencingModel.id)
            referencingRecords.set(loaded)
        } catch (e: any) {
            error = e.message
        }
    })
    const paginatedEditorHost = makePaginatedEditorHost(tenantId,models, referencingModel, referencingRecords)
</script>

<div class="mt-2">
    <PaginatedEditor {models} systemConfiguration={getSystemConfiguration($tenantEntities)}
                     model={referencingModel}
                     modelViews={$modelViews}
                     records={$referencingRecords}
                     onNewRecord={onNewRecordAssignReference}
                     {paginatedEditorHost}/>
</div>

{#if error}
    <ErrorMessage {error}/>
{/if}
