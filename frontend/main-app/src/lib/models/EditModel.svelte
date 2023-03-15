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
            <li class:active-nav-item={sectionToShow === 'model'} on:click={() => sectionToShow= 'model'}><a>Model</a>
            </li>
            <li class:active-nav-item={sectionToShow === 'appearance'} on:click={() => sectionToShow= 'appearance'}><a>Appearance</a>
            </li>
        </ul>
    </div>
</div>

<div class="mt-3">
{#if sectionToShow === 'model'}
    <ModelEditor {allModels} {host} {modelId}/>
    <br/>
    <button class="btn" type="button" on:click={saveModelBeingEdited}>Save model</button>
    <button class="btn" type="button" on:click={() => dispatch('finished')}>Cancel</button>
{/if}
{#if sectionToShow === 'appearance'}
        <h4>Summary card HTML</h4>
        <textarea class="textarea w-full input-bordered" rows="5" cols="80"
                  placeholder="HTML template for how this model looks in a summary card"></textarea>
{/if}
</div>
