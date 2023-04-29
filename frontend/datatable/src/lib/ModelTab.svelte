<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import DownCaret from "./icons/DownCaret.svelte";
    import type {Writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";

    export let model:EventSourcedModel
    export let index:number
    export let navbarState: Writable<string | null>
    export let onEditModelClicked:(clicked: Event, modelIndex: number) => void

    function showModel(modelId: ModelId) {
        navbarState.set(modelId.value)
    }

    function editModelClicked(clicked:Event) {
        onEditModelClicked(clicked, index)
    }
</script>

<div class="flex items-center">
    <a class="tab tab-lg tab-bordered mr-4 p-0 model-{index + 1}"
       class:tab-active={$navbarState === model.model.id.value}
       on:click={() => showModel(model.model.id)}>{model.model.pluralName.value}
        <span on:click={editModelClicked} class="ml-2 mt-1">
            <DownCaret/></span>
    </a>
</div>
