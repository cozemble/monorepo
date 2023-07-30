<script lang="ts">
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";
    import AddTableNavButton from "./AddTableNavButton.svelte";
    import Modals from "./Modals.svelte";
    import {modelUi} from "./modelUi";
    import {allEventSourcedModels, allTopLevelEventSourcedModels} from "./stores/allModels";
    import ModelPane from "./models/ModelPane.svelte";
    import ModelTab from "./ModelTab.svelte";
    import {contextHelper} from "./stores/contextHelper";
    import RecordCreatorContext from "./records/creator/RecordCreatorContext.svelte";
    import SwitchableModelPane from "$lib/models/SwitchableModelPane.svelte";

    export let navbarState: Writable<string | null> = writable(null)
    const permitModelling = contextHelper.getPermitModelling()

    function showModel(modelId: ModelId) {
        navbarState.set(modelId.value)
    }

    function onEditModelClicked(clicked: Event, modelIndex: number) {
        clicked.stopPropagation()
        const model = $allTopLevelEventSourcedModels[modelIndex]
        const anchor = (clicked.target as HTMLElement).closest(`.model-${modelIndex + 1}`) as HTMLElement
        if (model && anchor) {
            modelUi.edit(allEventSourcedModels, model, anchor)
        }
    }

    function newTableAdded(event: CustomEvent) {
        const modelId = event.detail.modelId
        if (modelId) {
            showModel(modelId)
        }
    }

</script>


<div class="tabs bg-base-200 rounded pb-1 pl-2">
    {#each $allTopLevelEventSourcedModels as model, index}
        <ModelTab {model} {index} {navbarState} {onEditModelClicked}/>
    {/each}
    {#if $permitModelling}
        <AddTableNavButton on:added={newTableAdded}/>
    {/if}
</div>

{#if $navbarState}
    {#key $navbarState}
        <RecordCreatorContext>
            <SwitchableModelPane>
                <ModelPane modelId={$navbarState}/>
            </SwitchableModelPane>
        </RecordCreatorContext>
    {/key}
{/if}

<Modals/>