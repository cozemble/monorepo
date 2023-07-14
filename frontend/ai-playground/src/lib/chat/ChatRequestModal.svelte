<script lang="ts">
    import {onMount} from 'svelte'
    import {clearCurrentAiChatRequest, currentAiChatRequest, currentAiChatRequestAttempts} from "$lib/chat/ChatTypes";
    import {makeAiChatRequest} from "$lib/chat/makeAiChatRequest";
    import type {JustErrorMessage, Value} from "@cozemble/lang-util";

    let modal: HTMLDialogElement
    let response: JustErrorMessage | Value | null = null

    onMount(async () => {
        modal.showModal()
        if ($currentAiChatRequest) {
            const request = $currentAiChatRequest!
            response = await makeAiChatRequest(request, $currentAiChatRequestAttempts)
            request.continuation(response)
            if (response._type !== 'just.error.message') {
                clearCurrentAiChatRequest()
            }
        }
    })
</script>

<dialog bind:this={modal} class="modal">
    <form method="dialog" class="modal-box">
        {#if response && response._type === 'just.error.message' }
            <h3 class="font-bold text-lg text-center text-error">Failed to get a useful response from the AI</h3>
            <h3 class="font-bold text-lg text-center text-error mt-2">{response.message}</h3>
            <div class="flex items-center mt-4">
                <button class="btn btn-primary mx-auto" on:click={clearCurrentAiChatRequest}>Dismiss</button>
            </div>
        {:else}
            <h3 class="font-bold text-lg text-center">Waiting for the AI to respond</h3>
            <p class="text-center mt-2">It can take up to 20 seconds...</p>
            {#if $currentAiChatRequestAttempts > 1}
                <p class="text-center mt-2">The AI returned an unusable response. Retrying...</p>
                <p class="text-center mt-2">Attempt {$currentAiChatRequestAttempts} of 3</p>
            {/if}
        {/if}
    </form>
</dialog>