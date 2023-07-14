<script lang="ts">
    import {registerEverything} from "@cozemble/model-assembled";
    import {modelStore, navbarState, newGenerationSessionId} from "$lib/generative/stores";
    import FirstPrompt from "$lib/generative/components/FirstPrompt.svelte";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelListFns} from "@cozemble/model-event-sourced";
    import {browser} from '$app/environment';
    import SocialButtons from "$lib/social/SocialButtons.svelte";
    import {setCurrentAiChatRequest} from "$lib/chat/ChatTypes";
    import {justErrorMessage} from "@cozemble/lang-util";

    function onChatRequestComplete(json: any) {
        console.log({json})
    }

    function looksLikeJsonSchema(json: any) {
        const looksOk = json && json.title && json.type && json.properties
        return looksOk ? null : justErrorMessage("Not a valid JSON Schema")
    }

    onMount(() => {
        newGenerationSessionId()
        registerEverything()
        // setCurrentAiChatRequest("/", {databaseType: "Customers"}, onChatRequestComplete, looksLikeJsonSchema)
    })

    function navigateToAmendments(models: EventSourcedModel[]) {
        // if in browser, check if we have a startOver query param
        if (!browser) {
            return
        }

        const urlParams = new URLSearchParams(window.location.search);
        const startOver = urlParams.get('startOver') === "true";
        if (startOver) {
            modelStore.update(() => eventSourcedModelListFns.newInstance([]))
            navbarState.set(null)
            goto("/")
        } else {
            if (models.length > 0) {
                goto("/amend")
            }
        }
    }

    $: navigateToAmendments($modelStore.models)

</script>
{#if $modelStore.models.length === 0}
    <FirstPrompt/>
{/if}

<footer class="footer p-10 bg-primary-content flex-col flex">
    <div class="flex w-full round h-12 rounded-2xl items-center justify-center">
        <SocialButtons/>
    </div>
</footer>
