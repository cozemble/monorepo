<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {Model, ModelId} from "@cozemble/model-core";
    import AddTableNavButton from "./AddTableNavButton.svelte";
    import Modals from "./Modals.svelte";
    import type {EventSourcedStore} from "./stores/EventSourcedStore";
    import type {TablesAction} from "./tables/actions";
    import {modelUi} from "./modelUi";
    import DownCaret from "./icons/DownCaret.svelte";

    export let tables: EventSourcedStore<Model[], TablesAction>
    const navbarState: Writable<string | null> = writable(null)

    function showTable(modelId: ModelId) {
        navbarState.set(modelId.value)
    }


    function onEditModelClicked(clicked: Event, modelIndex: number) {
        clicked.stopPropagation()
        const model = $tables[modelIndex]
        const anchor = (clicked.target as HTMLElement).closest(`.model-${modelIndex + 1}`) as HTMLElement
        if(model && anchor) {
            modelUi.edit(model, anchor)
        }
    }

</script>
<div class="tabs bg-base-200 rounded pb-1 pl-2">
    {#each $tables as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered mr-4 p-0 model-{index + 1}" class:tab-active={$navbarState === model.id.value}
               on:click={() => showTable(model.id)}>{model.pluralName.value}
                <span on:click={(clicked) => onEditModelClicked(clicked, index)} class="ml-2 mt-1">
            <DownCaret/></span>
            </a>
        </div>
    {/each}
    <AddTableNavButton {tables}/>
</div>

<Modals/>