<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {Model, ModelId} from "@cozemble/model-core";
    import AddTableNavButton from "./AddTableNavButton.svelte";
    import Modals from "./Modals.svelte";
    import type {EventSourcedStore} from "./stores/EventSourcedStore";
    import type {TablesAction} from "./tables/actions";

    export let tables: EventSourcedStore<Model[], TablesAction>
    const navbarState: Writable<string | null> = writable(null)

    function showTable(modelId: ModelId) {
        navbarState.set(modelId.value)
    }


    function onEditModelClicked(clicked: Event, model: Model) {
        clicked.stopPropagation()
        // editModel(model)
    }

</script>
<div class="tabs bg-base-300 rounded p-1">
    {#each $tables as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered mr-2 model-{index + 1}" class:tab-active={$navbarState === model.id.value}
               on:click={() => showTable(model.id)}>{model.pluralName.value}</a>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-6 h-6" on:click={(elem) => onEditModelClicked(elem,model)}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
        </div>
    {/each}
    <AddTableNavButton  {tables}/>
</div>

<Modals />