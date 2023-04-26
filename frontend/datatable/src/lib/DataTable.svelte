<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";
    import AddTableNavButton from "./AddTableNavButton.svelte";
    import Modals from "./Modals.svelte";
    import {modelUi} from "./modelUi";
    import DownCaret from "./icons/DownCaret.svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {allEventSourcedModels} from "./stores/allModels";
    import ModelPane from "./models/ModelPane.svelte";
    import type {SystemConfiguration} from "@cozemble/model-core";
    import {currentUserId} from "./stores/currentUserId";

    export let models: EventSourcedModel[]
    export let systemConfiguration:SystemConfiguration
    export let userId:string
    currentUserId.set(userId)
    allEventSourcedModels.set(models)
    const navbarState: Writable<string | null> = writable(null)

    function showModel(modelId: ModelId) {
        navbarState.set(modelId.value)
    }

    function onEditModelClicked(clicked: Event, modelIndex: number) {
        clicked.stopPropagation()
        const model = $allEventSourcedModels[modelIndex]
        const anchor = (clicked.target as HTMLElement).closest(`.model-${modelIndex + 1}`) as HTMLElement
        if (model && anchor) {
            modelUi.edit($allEventSourcedModels, model, anchor)
        }
    }

    function newTableAdded(event:CustomEvent) {
        const modelId = event.detail.modelId
        if (modelId) {
            showModel(modelId)
        }
    }

</script>
<div class="tabs bg-base-200 rounded pb-1 pl-2">
    {#each $allEventSourcedModels as model, index}
        <div class="flex items-center">
            <a class="tab tab-lg tab-bordered mr-4 p-0 model-{index + 1}"
               class:tab-active={$navbarState === model.model.id.value}
               on:click={() => showModel(model.model.id)}>{model.model.pluralName.value}
                <span on:click={(clicked) => onEditModelClicked(clicked, index)} class="ml-2 mt-1">
            <DownCaret/></span>
            </a>
        </div>
    {/each}
    <AddTableNavButton on:added={newTableAdded}/>
</div>

{#if $navbarState}
    {#key $navbarState}
        <ModelPane modelId={$navbarState} {systemConfiguration}/>
    {/key}
{/if}

<Modals/>