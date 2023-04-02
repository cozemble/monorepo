<script lang="ts">
    import type {DataRecord, Model, ModelId} from "@cozemble/model-core";
    import {modelFns} from "@cozemble/model-api";
    import {onMount} from "svelte";
    import {loadReferencingRecords} from "./loadReferencingRecords";
    import ErrorMessage from "../util/ErrorMessage.svelte";

    export let tenantId: string
    export let models: Model[]
    export let referencingModelId: ModelId
    export let record: DataRecord
    const referencingModel = modelFns.findById(models, referencingModelId)
    let referencingRecords: DataRecord[] = []
    let error: string | null = null

    onMount(async () => {
        try {
            referencingRecords = await loadReferencingRecords(tenantId, record.id, referencingModel.id)
        } catch (e:any) {
            error = e.message
        }
    })
</script>

<p>How {referencingModel.name.value} relates to {JSON.stringify(record)}</p>
<br/>
<p>{JSON.stringify(referencingRecords)}</p>
{#if error}
    <ErrorMessage {error}/>
{/if}
