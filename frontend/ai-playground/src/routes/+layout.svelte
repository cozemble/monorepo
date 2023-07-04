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

<!-- hidden content to force tailwind styles to be compiled in.  Yes, crazy -->
<div class="form-group mb-3 invisible">
    <input type="text" class="form-control input input-bordered border border-primary border-4"/>
</div>
