<script lang="ts">
    import {systemConfigurationStore} from "./systemConfigurationStore";
    import {slotSystemConfigurationDescriptors} from "@cozemble/model-core";

    export let tenantId: string;

    function save() {

    }
</script>
{#each slotSystemConfigurationDescriptors.list() as slot}
    {#await slot.editorComponent()}
    {:then component}
        <svelte:component this={component} {tenantId} systemConfiguration={$systemConfigurationStore}/>
    {/await}
{/each}

<div class="mt-3">
    <button class="btn" on:click={save}>Save</button>
</div>