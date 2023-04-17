<script lang="ts">
    import type {Model, ModelReference} from "@cozemble/model-core";
    import {modelReferenceFns} from "@cozemble/model-core";
    import type {ModelChangeHandler} from "./ModelEditorHost";
    import {modelSlotEvents} from "@cozemble/model-event-sourced";

    export let modelChangeHandler: ModelChangeHandler
    export let models: Model[]
    export let model: Model
    export let modelReference: ModelReference

    $: referencedModelId = modelReferenceFns.oneReference(modelReference)

    const otherModels = models.filter(m => m.id.value !== model.id.value)
    const otherModelIds = otherModels.map(model => model.id)

    function referencedModelChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const newValue = target.value
        const referencedModelId = otherModelIds.find(modelId => modelId.value === newValue) ?? null
        modelChangeHandler.modelChanged(
            model.id,
            modelSlotEvents.modelReferenceChanged(
                model.id,
                modelReference.id,
                referencedModelId,
            ),
        )
    }

</script>

<br/>
<label class="label" for="referencedModel">Referenced Model</label>
{#if otherModelIds.length === 0}
    <div>No other models to link to</div>
{:else}
    <select class="input input-bordered" id="referencedModel" on:change={referencedModelChanged}>
        <option selected={referencedModelId === null}>----</option>
        {#each otherModels as model}
            <option value={model.id.value}
                    selected={model.id.value === referencedModelId?.value}>{model.name.value}</option>
        {/each}
    </select>
{/if}
