<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import DownCaret from "./icons/DownCaret.svelte";
    import type {Writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";
    import {contextHelper} from "./stores/contextHelper";

    export let model: EventSourcedModel
    export let index: number
    export let navbarState: Writable<string | null>
    export let onEditModelClicked: (clicked: Event, modelIndex: number) => void
    const permitModelling = contextHelper.getPermitModelling()

    function showModel(modelId: ModelId) {
        navbarState.set(modelId.value)
    }

    function editModelClicked(clicked: Event) {
        onEditModelClicked(clicked, index)
    }
</script>

<div class="flex items-center">
    <a class="tab tab-lg model-{index + 1}"
       class:tab-active={$navbarState === model.model.id.value}
       on:click={() => showModel(model.model.id)}>{model.model.pluralName.value}
        {#if $permitModelling}
        <span on:click={editModelClicked} class="ml-2 mt-1 edit-model-{index + 1}">
            <DownCaret/></span>
        {/if}
    </a>
</div>