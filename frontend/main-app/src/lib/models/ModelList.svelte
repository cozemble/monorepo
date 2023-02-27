<script lang="ts">
    import {allModels, modelBeingEdited, type ModelEditContext} from "./modelsStore";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {goto} from '$app/navigation';
    import {page} from '$app/stores';
    import type {Page} from '@sveltejs/kit';

    function manageData(m: EventSourcedModel) {
        const p: Page = $page
        goto(`/tenants/${p.params.tenantId}/data/${m.model.id.value}`)
    }

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
                    <button on:click={() => manageData(model)}>Manage data</button>
                </td>
            </tr>
        {/if}
    {/each}
    </tbody>
</table>
