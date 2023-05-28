<script lang="ts">
    import type {ModelSlot} from "@cozemble/model-core";
    import {contextHelper} from "$lib/stores/contextHelper";
    import DownCaret from "$lib/icons/DownCaret.svelte";

    export let slot: ModelSlot
    export let index: number
    export let editSlot: (clicked: Event, slot: ModelSlot) => void
    export let permitModelEditing = true
    const globalPermitModelling = contextHelper.getPermitModelling()

    function onEditSlot(clicked:Event) {
        editSlot(clicked, slot)
    }
</script>

<th class="bg-base-300" id="field-{index + 1}">
    <div class="flex items-center"><span class="mr-1">{slot.name.value}</span>
        {#if permitModelEditing && $globalPermitModelling}
            <span class="mt-1 edit-field-{index + 1}" on:click={onEditSlot}><DownCaret/></span>
        {/if}
    </div>
</th>
