<script lang="ts">
    import {allModels, host, putAllModels} from "./modelsStore";

    import {ModelEditor} from "@cozemble/model-editor";
    import type {ModelId} from "@cozemble/model-core";
    import {createEventDispatcher} from "svelte";

    export let tenantId: string
    export let modelId: ModelId
    const dispatch = createEventDispatcher()

    async function saveModelBeingEdited() {
        await putAllModels(tenantId, $allModels)
        dispatch('finished')
    }

    let sectionToShow = 'model'

</script>


<div class="navbar bg-base-300 rounded-xl">
    <div>
        <ul class="menu menu-horizontal px-1">
                <li class:active-nav-item={sectionToShow === 'model'} on:click={() => sectionToShow= 'model'}><a>Model</a></li>
                <li class:active-nav-item={sectionToShow === 'naming'} on:click={() => sectionToShow= 'naming'}><a>Naming</a></li>
        </ul>
    </div>
</div>

{#if sectionToShow === 'model'}
    <ModelEditor {allModels} {host} {modelId}/>
    <br/>
    <button class="btn" type="button" on:click={saveModelBeingEdited}>Save model</button>
    <button class="btn" type="button" on:click={() => dispatch('finished')}>Cancel</button>
{/if}
{#if sectionToShow === 'naming'}
    Naming
{/if}
