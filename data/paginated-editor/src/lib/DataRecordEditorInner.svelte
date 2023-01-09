<script lang="ts">
    import type {DataRecord, DataRecordPathElement, Model} from "@cozemble/model-core";
    import PropertyEdit from "$lib/PropertyEdit.svelte";
    import {modelFns} from "@cozemble/model-api";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord
    export let parentPath: DataRecordPathElement[]

    console.log({models, model, record, parentPath})
</script>

<table>
    <thead>
    <tr>
        {#each model.properties as property}
            <th>{property.name.value}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    <tr>
        {#each model.properties as property}
            <td>
                <PropertyEdit {parentPath} {property} {record}/>
            </td>
        {/each}
    </tbody>
</table>

{#each model.relationships as relationship}
    {@const relatedModel = modelFns.findById(models, relationship.modelId)}
    <h3>{relationship.name.value}</h3>
    {#if relationship._type === "has.one.relationship"}
        <svelte:self {models} model={relatedModel} record={record.values[relationship.id.value]}
                     parentPath={[...parentPath, relationship]}/>
    {:else}
        to do : cardinality many
    {/if}
{/each}

<style>
    table {
        border-collapse: collapse;
    }

    th,
    td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>
