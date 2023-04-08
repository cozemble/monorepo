<script lang="ts">
    import {slotSystemConfigurationDescriptors} from "@cozemble/model-core";
    import {getSystemConfiguration, saveSystemConfiguration, tenantEntities} from "../models/tenantEntityStore";
    import {writable} from "svelte/store";
    import ErrorMessage from "../util/ErrorMessage.svelte";

    export let tenantId: string;
    let error: string | null = null

    const systemConfiguration = writable(getSystemConfiguration($tenantEntities))

    async function save() {
        await saveSystemConfiguration(tenantId, $systemConfiguration).catch(e => error = e.message)
    }

</script>
{#each slotSystemConfigurationDescriptors.list() as slot}
    {#await slot.editorComponent()}
    {:then component}
        <svelte:component this={component} {tenantId}
                          {systemConfiguration}/>
    {/await}
{/each}

<div class="mt-3">
    <button class="btn" on:click={save}>Save</button>
</div>

<ErrorMessage {error}/>