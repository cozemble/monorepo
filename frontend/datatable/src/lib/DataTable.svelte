<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {Model, ModelId} from "@cozemble/model-core";
    import AddTableNavButton from "./AddTableNavButton.svelte";
    import Modals from "./Modals.svelte";
    import type {EventSourcedStore} from "./stores/EventSourcedStore";
    import type {TablesAction} from "./tables/actions";
    import {DownCaret} from "@cozemble/ui-atoms";

    export let tables: EventSourcedStore<Model[], TablesAction>
    const navbarState: Writable<string | null> = writable(null)

    function showTable(modelId: ModelId) {
        navbarState.set(modelId.value)
    }


    function onEditModelClicked(clicked: Event, model: Model) {
        clicked.stopPropagation()
        console.log({model})
        // modelUi.
        // editModel(model)
    }

</script>
<div class="tabs bg-base-300 rounded p-1">
    {#each $tables as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered model-{index + 1} mr-3" class:tab-active={$navbarState === model.id.value}
               on:click={() => showTable(model.id)}>{model.pluralName.value}
                <span on:click={(clicked) => onEditModelClicked(clicked, model)} class="ml-2 mt-1">
            <DownCaret/></span>
            </a>
        </div>
    {/each}
    <AddTableNavButton {tables}/>
</div>

<Modals/>