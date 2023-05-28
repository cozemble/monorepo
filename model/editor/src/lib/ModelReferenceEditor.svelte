<script lang="ts">
    import type {Cardinality, ModelId, ModelReference} from "@cozemble/model-core";
    import {modelReferenceFns} from "@cozemble/model-core";
    import {
        type EventSourcedModelList,
        eventSourcedModelListEvents,
        eventSourcedModelListFns
    } from "@cozemble/model-event-sourced";
    import {naming} from "./namingStore";
    import type {Writable} from "svelte/store";

    export let modelList: Writable<EventSourcedModelList>
    export let modelId: ModelId
    export let modelReference: ModelReference

    $: referencedModelId = modelReferenceFns.getReferencedModelId(modelReference)

    const otherModels = $modelList.models.filter(m => m.model.id.value !== modelId.value)
    const otherModelIds = otherModels.map(model => model.model.id) as ModelId[]

    function referencedModelChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const newValue = target.value
        const referencedModelId = otherModelIds.find(modelId => modelId.value === newValue) ?? null
        modelList.update(ms => eventSourcedModelListFns.addEvent(ms, eventSourcedModelListEvents.setReferencedModelId(modelReference.id, modelId, referencedModelId, "many")))
    }

    function setCardinality(cardinality: Cardinality) {
        modelList.update(ms => eventSourcedModelListFns.addEvent(ms, eventSourcedModelListEvents.setModelReferenceCardinality(modelReference.id, modelId, cardinality)))
    }
</script>

<br/>
<label class="label" for="referencedModel">Referenced {$naming.modelNameSingular}</label>
{#if otherModelIds.length === 0}
    <div>No other {$naming.modelNamePlural.toLowerCase()} to link to</div>
{:else}
    <select class="input input-bordered w-full referenced-model" id="referencedModel"
            on:change={referencedModelChanged}>
        <option selected={referencedModelId === null}>----</option>
        {#each otherModels as model}
            <option value={model.model.id.value}
                    selected={model.model.id.value === referencedModelId?.value}>{model.model.name.value}</option>
        {/each}
    </select>
{/if}
<label class="label">Permit multiple records</label>
<input class="checkbox" type="radio" name="cardinality" value="many"
       checked={modelReference.cardinality === "many"} on:click={() => setCardinality('many')}/> Yes
<input class="checkbox" type="radio" name="cardinality" value="one" checked={modelReference.cardinality === "one"}
       on:click={() => setCardinality('one')}
/> No
