<script lang="ts">
    import {slotSystemConfigurationDescriptors} from "@cozemble/model-core";
    import {onMount} from "svelte";
    import {getSystemConfiguration, tenantEntities} from "../models/tenantEntityStore";
    import {writable} from "svelte/store";

    export let tenantId: string;
    let mounted = false

    const systemConfiguration = writable(getSystemConfiguration($tenantEntities))

    function save() {

    }

    onMount(async () => {
        mounted = true
        systemConfiguration.subscribe(config => console.log({config}))
    })
</script>
{#if mounted}
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
{/if}