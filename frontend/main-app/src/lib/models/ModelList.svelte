<script lang="ts">
    import {eventSourcedModels, modelBeingEdited, type ModelEditContext} from "./modelsStore";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";

    function editModel(m: EventSourcedModel) {
        const editContext: ModelEditContext = {context: 'edit', modelId: m.model.id}
        modelBeingEdited.set(editContext)
    }

</script>

<table class="table">
    <thead>
    <tr>
        <th>Model Name</th>
        <th>Actions</th>
    </tr>
    </thead>
    <tbody>
    {#each $eventSourcedModels as model}
        {#if !model.model.parentModelId}
            <tr>
                <td>{model.model.name.value}</td>
                <td>
                    <button class="btn btn-active btn-ghost" on:click={() => editModel(model)}>Edit</button>
                </td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>
