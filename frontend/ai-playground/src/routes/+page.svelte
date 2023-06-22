<script lang="ts">
    import {registerEverything} from "@cozemble/model-assembled";
    import {modelStore, navbarState} from "$lib/generative/stores";
    import FirstPrompt from "$lib/generative/components/FirstPrompt.svelte";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelListFns} from "@cozemble/model-event-sourced";
    import {browser} from '$app/environment';

    onMount(() => {
        registerEverything()
    })

    function navigateToAmendments(models: EventSourcedModel[]) {
        // if in browser, check if we have a startOver query param
        if (!browser) {
            return
        }

        const urlParams = new URLSearchParams(window.location.search);
        const startOver = urlParams.get('startOver') === "true";
        if (startOver) {
            modelStore.update(() => {
                return eventSourcedModelListFns.newInstance([])
            })
            navbarState.set(null)
            goto("/")
        } else {
            console.log({models})
            if (models.length > 0) {
                console.log({models})
                goto("/amend")
            }
        }
    }

    $: navigateToAmendments($modelStore.models)

</script>
{#if $modelStore.models.length === 0}
    <FirstPrompt/>
{/if}
