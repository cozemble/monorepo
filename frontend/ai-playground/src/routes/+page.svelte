<script lang="ts">
    import {registerEverything} from "@cozemble/model-assembled";
    import {afterUpdate, onMount} from "svelte";
    import {modelStore, showModels} from "$lib/generative/stores";
    import FirstPrompt from "$lib/generative/components/FirstPrompt.svelte";
    import ManageModels from "$lib/generative/components/ManageModels.svelte";

    onMount(() => {
        registerEverything()
    })

    afterUpdate(() => {
        console.log({modelStore: $modelStore})
    })
</script>
{#if $modelStore.models.length === 0}
    <FirstPrompt/>
{:else}
    {#if $showModels}
        <ManageModels/>
    {/if}
{/if}
