<script lang="ts">
    import {registerEverything} from "@cozemble/model-assembled";
    import {modelStore} from "$lib/generative/stores";
    import FirstPrompt from "$lib/generative/components/FirstPrompt.svelte";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";

    onMount(() => {
        registerEverything()
    })

    function navigateToAmendments(models: EventSourcedModel[]) {
        if (models.length > 0) {
            goto("/amend")
        }
    }

    $: navigateToAmendments($modelStore.models)

</script>
{#if $modelStore.models.length === 0}
    <FirstPrompt/>
{/if}
