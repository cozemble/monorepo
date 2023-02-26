<script lang="ts">
    import {allModels, modelBeingEdited, type ModelEditContext} from "./modelsStore";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";

    function editModel(m: EventSourcedModel) {
        const editContext: ModelEditContext = {context: 'edit', modelId: m.model.id}
        modelBeingEdited.set(editContext)
    }

</script>
<table>
    <thead>
    <tr>
        <th>Model Name</th>
        <th>Actions</th>
    </tr>
    </thead>
    <tbody>
    {#each $allModels as model}
        {#if !model.model.parentModelId}
            <tr>
                <td>{model.model.name.value}</td>
                <td>
                    <button on:click={() => editModel(model)}>Edit</button>
                </td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>

<style>
    table {
        border-collapse: collapse;
        margin-top: 1em;
    }

    table, th, td {
        border: 1px solid black;
        padding: 1em;
    }
</style>
