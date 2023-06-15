<script lang="ts">
    import {slotSystemConfigurationDescriptors} from "@cozemble/model-core";
    import {saveSystemConfiguration, systemConfiguration} from "../models/tenantEntityStore";
    import {writable} from "svelte/store";
    import ErrorMessage from "../util/ErrorMessage.svelte";
    import ThemeChange from "$lib/settings/ThemeChange.svelte";

    export let tenantId: string;
    let error: string | null = null

    const writableSystemConfiguration = writable($systemConfiguration)

    async function save() {
        await saveSystemConfiguration(tenantId, $writableSystemConfiguration).catch(e => error = e.message)
    }

</script>
{#each slotSystemConfigurationDescriptors.list() as slot}
    {#await slot.editorComponent()}
    {:then component}
        <svelte:component this={component} {tenantId}
                          systemConfiguration={writableSystemConfiguration}/>
    {/await}
{/each}

<div class="mt-3">
    <ThemeChange/>
</div>
<div class="mt-3">
    <button class="btn" on:click={save}>Save</button>
</div>

<ErrorMessage {error}/>