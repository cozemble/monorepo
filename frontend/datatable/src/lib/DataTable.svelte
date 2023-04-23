<script lang="ts">
    import type {Readable, Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";
    import type {Model} from "@cozemble/model-core";

    export let models: Readable<Model[]>
    const navbarState: Writable<string | null> = writable(null)

    function showModel(modelId: ModelId) {
        navbarState.set(modelId.value)
    }

    function addModel() {

    }

    function onEditModelClicked(clicked: Event, model: Model) {
        clicked.stopPropagation()
        // editModel(model)
    }

</script>
<div class="tabs bg-base-300 rounded p-1">
    {#each $models as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered mr-2 model-{index + 1}" class:tab-active={$navbarState === model.id.value}
               on:click={() => showModel(model.id)}>{model.pluralName}</a>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-6 h-6" on:click={(elem) => onEditModelClicked(elem,model)}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
        </div>
    {/each}
    {#if $models.length === 0}
        <a class="tab tab-lg"
           on:click={addModel}>+ Add your first table</a>
    {:else}
        <a class="tab tab-lg"
           on:click={addModel}>+ Add table</a>
    {/if}
</div>
