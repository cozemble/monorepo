<script lang="ts">
    import type {ModelSlot} from "@cozemble/model-core";
    import DownCaret from "../icons/DownCaret.svelte";

    export let slot: ModelSlot
    export let index: number
    export let editSlot: (clicked: Event, slot: ModelSlot) => void
    export let permitModelEditing = true

    function onEditSlot(clicked:Event) {
        editSlot(clicked, slot)
    }
</script>

<th class="bg-base-300" id="field-{index + 1}">
    <div class="flex items-center"><span class="mr-1">{slot.name.value}</span>
        {#if permitModelEditing}
            <span class="mt-1" on:click={onEditSlot}><DownCaret/></span>
        {/if}
    </div>
</th>
