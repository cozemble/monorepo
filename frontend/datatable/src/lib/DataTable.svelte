<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";
    import AddTableNavButton from "./AddTableNavButton.svelte";
    import Modals from "./Modals.svelte";
    import {modelUi} from "./modelUi";
    import DownCaret from "./icons/DownCaret.svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced/dist/esm";
    import {allModels} from "./stores/allModels";

    export let models: EventSourcedModel[]
    allModels.set(models)
    const navbarState: Writable<string | null> = writable(null)

    function showModel(modelId: ModelId) {
        navbarState.set(modelId.value)
    }

    function onEditModelClicked(clicked: Event, modelIndex: number) {
        clicked.stopPropagation()
        const model = $allModels[modelIndex]
        const anchor = (clicked.target as HTMLElement).closest(`.model-${modelIndex + 1}`) as HTMLElement
        if (model && anchor) {
            modelUi.edit($allModels,model, anchor)
        }
    }

</script>
<div class="tabs bg-base-200 rounded pb-1 pl-2">
    {#each $allModels as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered mr-4 p-0 model-{index + 1}"
               class:tab-active={$navbarState === model.model.id.value}
               on:click={() => showModel(model.model.id)}>{model.model.pluralName.value}
                <span on:click={(clicked) => onEditModelClicked(clicked, index)} class="ml-2 mt-1">
            <DownCaret/></span>
            </a>
        </div>
    {/each}
    <AddTableNavButton />
</div>

<Modals/>