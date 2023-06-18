<script lang="ts">
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from "svelte";
    import {modelStore} from "$lib/generative/stores";
    import FirstPrompt from "$lib/generative/components/FirstPrompt.svelte";
    import ManageModels from "$lib/generative/components/ManageModels.svelte";

    onMount(() => {
        registerEverything()
    })
</script>
{#if $modelStore.models.length === 0}
    <FirstPrompt/>
{:else}
    <ManageModels />
{/if}
