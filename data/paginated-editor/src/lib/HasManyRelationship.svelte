<script lang="ts">
    import type {DataRecordPathFocus} from "$lib/DataRecordPathFocus";
    import type {
        DataRecord,
        DataRecordPath,
        DataRecordPathElement,
        HasManyRelationship,
        Model
    } from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import {dataRecordTableClicked} from "./dataRecordTableClicked";
    import {modelFns} from "@cozemble/model-api";
    import DataRecordTableTd from "$lib/DataRecordTableTd.svelte";

    export let models: Model[]
    export let record: DataRecord
    export let parentPath: DataRecordPathElement[]
    export let errors: Map<DataRecordPath, string[]>
    export let focus: Writable<DataRecordPathFocus>
    export let relationship: HasManyRelationship

    $: model = modelFns.findById(models, relationship.modelId)
    $: records = record.values[relationship.id.value] ?? []
</script>

<table on:click={event => dataRecordTableClicked(focus, event)}>
    <thead>
    <tr>
        {#each model.properties as property}
            <th>{property.name.value}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    {#each records as record}
        <tr>
            {#each model.properties as property}
                <DataRecordTableTd {property} {record} {parentPath} {errors} {focus}/>
            {/each}
        </tr>
    {/each}
    </tbody>
</table>
<div class="bottom-buttons">
    <button type="button">Add {model.name.value}</button>
</div>

<style>
    .bottom-buttons {
        margin-top: 1rem;
    }

    table {
        border-collapse: collapse;
    }

    th {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>