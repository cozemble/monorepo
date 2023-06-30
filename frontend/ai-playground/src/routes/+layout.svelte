<script lang="ts">
    import '../lib/styles/global.css'
    import {currentAiChatRequest} from "$lib/chat/ChatTypes";
    import ChatRequestModal from "$lib/chat/ChatRequestModal.svelte";
</script>

<main class="h-full w-full p-4">
    <slot/>
</main>

{#if $currentAiChatRequest}
    <ChatRequestModal/>
{/if}